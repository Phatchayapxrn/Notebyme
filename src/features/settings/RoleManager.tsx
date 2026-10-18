// =====================================================================
// RoleManager : ตั้งค่ายศ (เฉพาะแอดมินเห็น) อยู่ในหน้าตั้งค่า
//   1) ยศ : สร้าง / เปลี่ยนชื่อ / ลบ ยศ + ใส่อีเมลคนลงในยศ
//   2) ใครเห็นระบบไหน : แต่ละระบบเลือก "ทุกคน" หรือ "เฉพาะยศ" แล้วติ๊กยศที่เห็นได้
// แอดมินเห็นทุกระบบเสมอ / คนทั่วไปไม่เห็นกล่องนี้ และไม่รู้ว่าตัวเองมียศอะไร
// ข้อมูลของแต่ละคนยังแยกกัน (ยศ = สิทธิ์เปิดระบบ ไม่ได้ให้เห็นข้อมูลของเรา)
// =====================================================================
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useAllFeatures } from '@/shared/layout/useAllFeatures'
import { useAccess } from '@/shared/access/AccessProvider'
import {
  ALWAYS_OPEN_FEATURES,
  addRole,
  addRoleMember,
  cleanEmail,
  deleteRole,
  getAllFeatureRules,
  getAllRoleMembers,
  getAllRoles,
  removeRoleMember,
  renameRole,
  saveFeatureRule,
  type FeatureRule,
  type Role,
  type RoleMember,
} from '@/shared/access/accessDatabase'
import { IconButton, RoundButton } from '@/shared/parts/RoundButton'
import { TagButton } from '@/shared/parts/TagButton'
import { ConfirmBox } from '@/shared/parts/PopupBox'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { useShowMessage } from '@/shared/parts/PopupMessage'

export function RoleManager() {
  const features = useAllFeatures()
  const { loadAgain: checkMyAccessAgain } = useAccess()
  const showMessage = useShowMessage()
  const [roles, setRoles] = useState<Role[]>([])
  const [members, setMembers] = useState<RoleMember[]>([])
  const [rules, setRules] = useState<FeatureRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newRoleName, setNewRoleName] = useState('')
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  /** โหลดข้อมูลยศทั้งหมดใหม่ */
  const loadAll = useCallback(async () => {
    try {
      const [newRoles, newMembers, newRules] = await Promise.all([getAllRoles(), getAllRoleMembers(), getAllFeatureRules()])
      setRoles(newRoles)
      setMembers(newMembers)
      setRules(newRules)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'โหลดข้อมูลยศไม่สำเร็จ', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showMessage])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  /** ทำงาน → โหลดใหม่ → ถ้าพลาดเด้งข้อความเตือน */
  async function tryTo(action: () => Promise<void>, successText?: string) {
    try {
      await action()
      if (successText) showMessage(successText)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ทำไม่สำเร็จ', 'error')
    }
    await loadAll()
    checkMyAccessAgain()
  }

  function addNewRole(event: FormEvent) {
    event.preventDefault()
    const name = newRoleName.trim()
    if (!name) return
    setNewRoleName('')
    tryTo(() => addRole(name), `สร้างยศ "${name}" แล้ว`)
  }

  /** กฎของระบบนี้ (ยังไม่เคยตั้ง = ทุกคนเห็น) */
  function findRule(featureId: string): FeatureRule {
    return rules.find((rule) => rule.featureId === featureId) ?? { featureId, isLocked: false, allowedRoleIds: [] }
  }

  /** ติ๊ก / เอาติ๊กออก ยศในระบบนี้ */
  function toggleRoleInRule(rule: FeatureRule, roleId: string) {
    const allowedRoleIds = rule.allowedRoleIds.includes(roleId)
      ? rule.allowedRoleIds.filter((id) => id !== roleId)
      : [...rule.allowedRoleIds, roleId]
    tryTo(() => saveFeatureRule({ ...rule, allowedRoleIds }))
  }

  const lockableFeatures = features
    .filter((feature) => !ALWAYS_OPEN_FEATURES.includes(feature.id))
    .sort((first, second) => first.menuOrder - second.menuOrder)

  if (isLoading) return <LoadingDots />

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- 1) ยศ ---------- */}
      <section>
        <p className="small-label mb-1">ยศ</p>
        <p className="mb-3 text-sm text-soft">ใส่อีเมลที่เขาใช้ล็อกอิน คนที่ได้ยศจะไม่เห็นชื่อยศของตัวเอง</p>

        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <RoleBox
              key={role.id}
              role={role}
              members={members.filter((member) => member.roleId === role.id)}
              onRename={(name) => tryTo(() => renameRole(role.id, name))}
              onDelete={() => setRoleToDelete(role)}
              onAddMember={(email) => tryTo(() => addRoleMember(role.id, email), `เพิ่ม ${cleanEmail(email)} แล้ว`)}
              onRemoveMember={(email) => tryTo(() => removeRoleMember(role.id, email))}
            />
          ))}
        </div>

        <form onSubmit={addNewRole} className="mt-3 flex gap-2">
          <input
            className="text-input flex-1 py-2.5"
            placeholder="ชื่อยศใหม่ เช่น ทีมร้าน"
            value={newRoleName}
            onChange={(event) => setNewRoleName(event.target.value)}
            aria-label="ชื่อยศใหม่"
            maxLength={60}
          />
          <RoundButton look="main" type="submit" icon={<Plus size={16} />} disabled={!newRoleName.trim()}>
            สร้างยศ
          </RoundButton>
        </form>
      </section>

      {/* ---------- 2) ใครเห็นระบบไหน ---------- */}
      <section>
        <p className="small-label mb-1">ใครเห็นระบบไหน</p>
        <p className="mb-3 text-sm text-soft">แอดมินเห็นทุกระบบเสมอ / หน้าแรก ตั้งค่า ถังขยะ ทุกคนเห็นเสมอ</p>

        <div className="flex flex-col gap-2">
          {lockableFeatures.map((feature) => {
            const rule = findRule(feature.id)
            return (
              <div key={feature.id} className="rounded-2xl border border-line px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <feature.menuIcon size={18} className="text-soft" aria-hidden="true" />
                  <span className="flex-1 text-[15px] text-ink">{feature.menuName}</span>
                  <TagButton isSelected={!rule.isLocked} onClick={() => rule.isLocked && tryTo(() => saveFeatureRule({ ...rule, isLocked: false }))}>
                    ทุกคน
                  </TagButton>
                  <TagButton isSelected={rule.isLocked} onClick={() => !rule.isLocked && tryTo(() => saveFeatureRule({ ...rule, isLocked: true }))}>
                    เฉพาะยศ
                  </TagButton>
                </div>
                {rule.isLocked && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {roles.length === 0 ? (
                      <span className="text-sm text-soft">ยังไม่มียศ (ตอนนี้แอดมินเห็นคนเดียว)</span>
                    ) : (
                      <>
                        <span className="text-xs text-soft">ยศที่เห็น:</span>
                        {roles.map((role) => (
                          <TagButton
                            key={role.id}
                            look="flat"
                            isSelected={rule.allowedRoleIds.includes(role.id)}
                            onClick={() => toggleRoleInRule(rule, role.id)}
                          >
                            {role.name}
                          </TagButton>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <ConfirmBox
        isOpen={roleToDelete !== null}
        title="ลบยศ?"
        text={`คนในยศ "${roleToDelete?.name ?? ''}" จะเห็นระบบที่ล็อกไว้ไม่ได้อีก (ข้อมูลของเขาไม่หาย)`}
        confirmText="ลบยศ"
        isDanger
        onConfirm={() => roleToDelete && tryTo(() => deleteRole(roleToDelete.id, rules), 'ลบยศแล้ว')}
        onClose={() => setRoleToDelete(null)}
      />
    </div>
  )
}

interface RoleBoxProps {
  role: Role
  members: RoleMember[]
  onRename: (name: string) => void
  onDelete: () => void
  onAddMember: (email: string) => void
  onRemoveMember: (email: string) => void
}

/** กล่องยศ 1 ยศ: ชื่อ (แก้ได้) + รายชื่ออีเมล + ช่องเพิ่มอีเมล */
function RoleBox({ role, members, onRename, onDelete, onAddMember, onRemoveMember }: RoleBoxProps) {
  const [name, setName] = useState(role.name)
  const [email, setEmail] = useState('')

  useEffect(() => setName(role.name), [role.name])

  function finishRename() {
    const newName = name.trim()
    if (newName && newName !== role.name) onRename(newName)
    else setName(role.name)
  }

  function addMember(event: FormEvent) {
    event.preventDefault()
    if (!cleanEmail(email).includes('@')) return
    onAddMember(email)
    setEmail('')
  }

  return (
    <div className="rounded-2xl border border-line p-3">
      <div className="flex items-center gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg bg-transparent px-1 py-1 text-[16px] font-medium text-ink focus:bg-blush focus:outline-none"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={finishRename}
          onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
          aria-label="ชื่อยศ"
          maxLength={60}
        />
        <span className="font-typewriter text-xs text-soft">{members.length} คน</span>
        <IconButton label={`ลบยศ ${role.name}`} onClick={onDelete} className="h-9 w-9">
          <Trash2 size={16} />
        </IconButton>
      </div>

      {members.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {members.map((member) => (
            <span key={member.email} className="inline-flex items-center gap-1 rounded-full bg-blush py-1 pl-3 pr-1 text-sm text-ink">
              {member.email}
              <button
                type="button"
                aria-label={`เอา ${member.email} ออกจากยศ`}
                onClick={() => onRemoveMember(member.email)}
                className="grid h-6 w-6 place-items-center rounded-full text-soft hover:bg-paper hover:text-ink"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <form onSubmit={addMember} className="mt-2 flex gap-2">
        <input
          type="email"
          className="text-input flex-1 py-2 text-sm"
          placeholder="อีเมลที่จะให้ยศนี้"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-label={`เพิ่มอีเมลในยศ ${role.name}`}
        />
        <RoundButton look="pink" size="small" type="submit" icon={<Plus size={15} />} disabled={!email.includes('@')}>
          เพิ่ม
        </RoundButton>
      </form>
    </div>
  )
}