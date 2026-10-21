// =====================================================================
// fileStorage.ts : อัปโหลด / เปิด / ลบ ไฟล์รูปและวิดีโอ
//
// ไฟล์จริงเก็บใน Supabase Storage (ถังชื่อ user-files แบบส่วนตัว)
// ข้อมูลไฟล์ (ของใคร ขนาดเท่าไหร่) เก็บในตาราง files
//
// ระบบใหม่ในอนาคตใช้ได้เลย แค่ส่ง belongsToType เป็นชื่อระบบตัวเอง เช่น 'diary'
// =====================================================================
import imageCompression from 'browser-image-compression'
import { database, getMyUserId, stopIfError } from '@/shared/database'
import { makeId } from '@/shared/text/makeId'

/** ชื่อถังเก็บไฟล์ใน Supabase Storage */
const BUCKET_NAME = 'user-files'

/** ขนาดวิดีโอใหญ่สุดที่อัปได้ (50MB = เพดานของ Supabase แบบฟรี) */
export const BIGGEST_VIDEO_SIZE = 50 * 1024 * 1024

/** ขนาดรูปใหญ่สุดก่อนย่อ (ใหญ่กว่านี้ไม่รับ) */
export const BIGGEST_PICTURE_SIZE = 30 * 1024 * 1024

/** พื้นที่ทั้งหมดของ Supabase แบบฟรี (1GB) ใช้โชว์ในหน้าตั้งค่า */
export const FREE_SPACE_LIMIT = 1024 * 1024 * 1024

/** ข้อมูลที่ได้กลับมาหลังอัปโหลดเสร็จ */
export interface UploadedFile {
  filePath: string
  fileType: string
  width?: number
  height?: number
}

/** บอกว่าไฟล์นี้เป็นของอะไร */
export interface FileOwner {
  /** ประเภทเจ้าของ เช่น 'note', 'group' */
  belongsToType: string
  /** id ของเจ้าของ */
  belongsToId: string
}

// ---------------------------------------------------------------------
// อัปโหลด
// ---------------------------------------------------------------------

/** ย่อรูปให้เล็กลง (ด้านยาวสุด 2000px) เพื่อประหยัดพื้นที่ — gif จะไม่ย่อเพราะจะไม่ขยับ */
export async function shrinkPicture(picture: File): Promise<File> {
  if (picture.type === 'image/gif' || picture.type === 'image/svg+xml') return picture
  const smallPicture = await imageCompression(picture, {
    maxWidthOrHeight: 2000,
    maxSizeMB: 1.5,
    useWebWorker: true,
    initialQuality: 0.85,
  })
  return new File([smallPicture], picture.name, { type: smallPicture.type })
}

/** อัปโหลดรูป (ย่อให้ก่อนอัตโนมัติ) */
export async function uploadPicture(picture: File, owner: FileOwner): Promise<UploadedFile> {
  if (!picture.type.startsWith('image/')) throw new Error('ไฟล์นี้ไม่ใช่รูปภาพ')
  if (picture.size > BIGGEST_PICTURE_SIZE) throw new Error('รูปใหญ่เกินไป (เกิน 30MB)')
  const smallPicture = await shrinkPicture(picture)
  const size = await readPictureSize(smallPicture)
  return uploadAnyFile(smallPicture, owner, size)
}

/** อัปโหลดวิดีโอ (ไม่เกิน 50MB) */
export async function uploadVideo(video: File, owner: FileOwner): Promise<UploadedFile> {
  if (!video.type.startsWith('video/')) throw new Error('ไฟล์นี้ไม่ใช่วิดีโอ')
  if (video.size > BIGGEST_VIDEO_SIZE) {
    throw new Error(`วิดีโอใหญ่เกินไป (${toReadableSize(video.size)}) ใส่ได้ไม่เกิน 50MB`)
  }
  return uploadAnyFile(video, owner)
}

/** อัปโหลดไฟล์อะไรก็ได้ + จดลงตาราง files */
async function uploadAnyFile(
  file: File,
  owner: FileOwner,
  size?: { width: number; height: number },
): Promise<UploadedFile> {
  const userId = await getMyUserId()
  const fileEnding = getFileEnding(file)
  const filePath = `${userId}/${owner.belongsToType}/${owner.belongsToId}/${makeId()}.${fileEnding}`

  const { error: uploadError } = await database.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { contentType: file.type, cacheControl: '31536000' })
  stopIfError(uploadError)

  const { error: saveError } = await database.from('files').insert({
    belongs_to_type: owner.belongsToType,
    belongs_to_id: owner.belongsToId,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    width: size?.width ?? null,
    height: size?.height ?? null,
  })
  stopIfError(saveError)

  return { filePath, fileType: file.type, width: size?.width, height: size?.height }
}

// ---------------------------------------------------------------------
// เปิดดู (ขอลิงก์ชั่วคราว เพราะถังเป็นแบบส่วนตัว)
// ---------------------------------------------------------------------

/** ลิงก์ที่ขอไว้แล้ว เก็บไว้ใช้ซ้ำ จะได้ไม่ต้องขอใหม่ทุกครั้ง */
const savedLinks = new Map<string, { link: string; expireTime: number }>()

/** อายุลิงก์ (วินาที) */
const LINK_LIFE_SECONDS = 60 * 60 * 6 // 6 ชั่วโมง

/** ขอลิงก์สำหรับเปิดไฟล์ (ใช้ใส่ใน <img src> หรือ <video src>) */
export async function getFileLink(filePath: string): Promise<string> {
  const saved = savedLinks.get(filePath)
  if (saved && saved.expireTime > Date.now()) return saved.link

  const { data, error } = await database.storage.from(BUCKET_NAME).createSignedUrl(filePath, LINK_LIFE_SECONDS)
  stopIfError(error)
  const link = data!.signedUrl
  // ใช้ได้จริงน้อยกว่าอายุลิงก์ 10 นาที กันหมดอายุตอนกำลังดู
  savedLinks.set(filePath, { link, expireTime: Date.now() + (LINK_LIFE_SECONDS - 600) * 1000 })
  return link
}

// ---------------------------------------------------------------------
// ลบ
// ---------------------------------------------------------------------

/** ลบไฟล์หลายไฟล์ (ทั้งตัวไฟล์ และข้อมูลในตาราง files) */
export async function deleteFiles(filePaths: string[]) {
  if (filePaths.length === 0) return
  const { error: storageError } = await database.storage.from(BUCKET_NAME).remove(filePaths)
  stopIfError(storageError)
  const { error: tableError } = await database.from('files').delete().in('file_path', filePaths)
  stopIfError(tableError)
  filePaths.forEach((filePath) => savedLinks.delete(filePath))
}

/** ลบไฟล์เดียว */
export async function deleteFile(filePath: string) {
  await deleteFiles([filePath])
}

/** ดึงรายชื่อไฟล์ทั้งหมดของเจ้าของคนนี้ */
export async function getFilesOf(owner: FileOwner): Promise<string[]> {
  const { data, error } = await database
    .from('files')
    .select('file_path')
    .eq('belongs_to_type', owner.belongsToType)
    .eq('belongs_to_id', owner.belongsToId)
  stopIfError(error)
  return (data ?? []).map((row) => row.file_path as string)
}

/** ลบไฟล์ทั้งหมดของเจ้าของคนนี้ (ใช้ตอนลบโน๊ตถาวร) */
export async function deleteAllFilesOf(owner: FileOwner) {
  await deleteFiles(await getFilesOf(owner))
}

/** ลบไฟล์ที่ไม่ได้ใช้แล้ว (เช่น ลบรูปออกจากโน๊ตแล้ว) — usedFilePaths = ไฟล์ที่ยังใช้อยู่ */
export async function deleteUnusedFiles(owner: FileOwner, usedFilePaths: string[]) {
  const allFilePaths = await getFilesOf(owner)
  const unusedFilePaths = allFilePaths.filter((filePath) => !usedFilePaths.includes(filePath))
  await deleteFiles(unusedFilePaths)
}

/** พื้นที่ที่ใช้ไปทั้งหมด (byte) */
export async function getUsedSpace(): Promise<number> {
  const { data, error } = await database.from('files').select('file_size')
  stopIfError(error)
  return (data ?? []).reduce((total, row) => total + Number(row.file_size), 0)
}

// ---------------------------------------------------------------------
// ตัวช่วยเล็กๆ
// ---------------------------------------------------------------------

/** เปลี่ยนขนาด byte เป็นข้อความอ่านง่าย เช่น 12.5 MB */
export function toReadableSize(byteCount: number): string {
  if (byteCount < 1024) return `${byteCount} B`
  if (byteCount < 1024 * 1024) return `${(byteCount / 1024).toFixed(0)} KB`
  if (byteCount < 1024 * 1024 * 1024) return `${(byteCount / 1024 / 1024).toFixed(1)} MB`
  return `${(byteCount / 1024 / 1024 / 1024).toFixed(2)} GB`
}

/** หานามสกุลไฟล์ เช่น jpg, mp4 */
function getFileEnding(file: File): string {
  const fromName = file.name.split('.').pop()
  if (fromName && fromName.length <= 5 && fromName !== file.name) return fromName.toLowerCase()
  return file.type.split('/')[1] || 'bin'
}

/** อ่านความกว้าง/สูงของรูป */
function readPictureSize(picture: File): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    const image = new Image()
    const link = URL.createObjectURL(picture)
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
      URL.revokeObjectURL(link)
    }
    image.onerror = () => {
      resolve(undefined)
      URL.revokeObjectURL(link)
    }
    image.src = link
  })
}
