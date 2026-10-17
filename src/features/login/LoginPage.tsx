// =====================================================================
// LoginPage : หน้าเข้าสู่ระบบ / สมัครใหม่ (/login)
// หน้าตาแบบรูป "nice to meet you !" (กล่องหน้าต่าง + ปุ่มชมพู + กลีบดอกไม้ร่วง)
// =====================================================================
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FolderOpen, X } from 'lucide-react'
import { isDatabaseReady } from '@/shared/database'
import { useLogin } from '@/shared/login/LoginProvider'
import { WindowBox } from '@/shared/parts/WindowBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { logIn, signUp } from './loginActions'
import { FallingPetals } from './FallingPetals'
import { SetupNeededMessage } from './SetupNeededMessage'

type FormMode = 'log-in' | 'sign-up'

export function LoginPage() {
  const { user, isChecking } = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const goBackTo = (location.state as { goBackTo?: string } | null)?.goBackTo ?? '/'

  const [formMode, setFormMode] = useState<FormMode>('log-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [infoText, setInfoText] = useState('')

  if (!isDatabaseReady) return <SetupNeededMessage />
  if (isChecking) return <LoadingDots />
  if (user) return <Navigate to={goBackTo} replace />

  async function sendForm(event: FormEvent) {
    event.preventDefault()
    setErrorText('')
    setInfoText('')
    setIsWorking(true)
    try {
      if (formMode === 'log-in') {
        await logIn(email.trim(), password)
        navigate(goBackTo, { replace: true })
      } else {
        const needEmailCheck = await signUp(email.trim(), password)
        if (needEmailCheck) {
          setInfoText('สมัครแล้ว! เช็คอีเมลแล้วกดลิงก์ยืนยัน จากนั้นกลับมาเข้าสู่ระบบนะ')
          setFormMode('log-in')
        } else {
          navigate('/', { replace: true })
        }
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'มีบางอย่างผิดพลาด')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div className="space-for-top-notch relative grid min-h-dvh place-items-center px-4 py-10">
      <FallingPetals />
      <WindowBox
        className="relative w-full max-w-lg"
        title={<span className="font-typewriter">nice to meet you !</span>}
        rightSide={
          <span className="flex gap-1 text-soft" aria-hidden="true">
            <FolderOpen size={18} />
            <X size={18} />
          </span>
        }
        insideClassName="p-5 sm:p-7"
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-20 w-20 flex-none place-items-center rounded-2xl border-[1.5px] border-line bg-blush text-4xl" aria-hidden="true">
            🌸
          </div>
          <div>
            <h1 className="font-cute text-3xl font-semibold text-rose">Idea Notes</h1>
            <p className="text-sm text-soft">จดไอเดียแยกหมวด + สิ่งที่ต้องทำ ใช้ได้ทุกเครื่อง</p>
          </div>
        </div>

        {/* เลือก เข้าสู่ระบบ / สมัครใหม่ */}
        <div className="mb-5 grid grid-cols-2 gap-3" role="tablist">
          <RoundButton
            role="tab"
            aria-selected={formMode === 'log-in'}
            look={formMode === 'log-in' ? 'main' : 'pink'}
            onClick={() => setFormMode('log-in')}
          >
            เข้าสู่ระบบ
          </RoundButton>
          <RoundButton
            role="tab"
            aria-selected={formMode === 'sign-up'}
            look={formMode === 'sign-up' ? 'main' : 'pink'}
            onClick={() => setFormMode('sign-up')}
          >
            สมัครใหม่
          </RoundButton>
        </div>

        <form onSubmit={sendForm} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="small-label">อีเมล</span>
            <input
              type="email"
              className="text-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="small-label">รหัสผ่าน</span>
            <input
              type="password"
              className="text-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={formMode === 'log-in' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </label>

          {errorText && <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm text-danger">{errorText}</p>}
          {infoText && <p className="rounded-xl bg-blush px-4 py-2.5 text-sm text-wine">{infoText}</p>}

          <RoundButton look="main" size="big" type="submit" disabled={isWorking} className="mt-1 w-full">
            {isWorking ? 'รอสักครู่...' : formMode === 'log-in' ? 'เข้าสู่ระบบ' : 'สมัครเลย'}
          </RoundButton>
        </form>
      </WindowBox>
    </div>
  )
}
