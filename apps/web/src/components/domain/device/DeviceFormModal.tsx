import { useEffect, useState } from 'react'
import Modal from '../../ui/Modal'
import type { DeviceDto, CreateDevicePayload, UpdateDevicePayload } from '../../../lib/api/device.api'

interface DeviceFormModalProps {
  open:     boolean
  onClose:  () => void
  onSubmit: (payload: CreateDevicePayload | UpdateDevicePayload) => Promise<void>
  device?:  DeviceDto
  loading?: boolean
}

const ADDRESS_OPTIONS = [
  { value: 1, label: 'R1 (주소 1)' },
  { value: 2, label: 'R2 (주소 2)' },
]

export default function DeviceFormModal({
  open,
  onClose,
  onSubmit,
  device,
  loading = false,
}: DeviceFormModalProps) {
  const isEdit = !!device

  const [name,    setName]    = useState('')
  const [ip,      setIp]      = useState('')
  const [port,    setPort]    = useState('4001')
  const [slaveId, setSlaveId] = useState('1')
  const [address, setAddress] = useState(0)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!open) return
    if (device) {
      setName(device.name)
      setIp(device.ip)
      setPort(String(device.port))
      setSlaveId(String(device.slaveId))
      setAddress(device.address)
    } else {
      setName('')
      setIp('')
      setPort('4001')
      setSlaveId('1')
      setAddress(1)
    }
    setError('')
  }, [open, device])

  const canSubmit =
    name.trim().length > 0 &&
    ip.trim().length > 0 &&
    Number(port) > 0 &&
    Number(port) <= 65535 &&
    Number(slaveId) >= 1 &&
    Number(slaveId) <= 247

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || loading) return
    setError('')
    try {
      if (isEdit) {
        const payload: UpdateDevicePayload = {}
        if (name    !== device!.name)              payload.name    = name.trim()
        if (ip      !== device!.ip)                payload.ip      = ip
        if (Number(port)    !== device!.port)      payload.port    = Number(port)
        if (Number(slaveId) !== device!.slaveId)   payload.slaveId = Number(slaveId)
        if (address !== device!.address)           payload.address = address
        await onSubmit(payload)
      } else {
        const payload: CreateDevicePayload = {
          name:    name.trim(),
          ip,
          port:    Number(port),
          slaveId: Number(slaveId),
          address,
        }
        await onSubmit(payload)
      }
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  const inputClass = `
    h-[52px] rounded-md border border-line bg-surface
    px-4 text-[15px] text-ink placeholder:text-ink-3
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light
    disabled:bg-canvas disabled:text-ink-3 w-full
  `

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '장치 수정' : '장치 추가'}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={loading}
            className="h-10 px-4 rounded-full text-[14px] font-medium
                       text-ink-2 bg-canvas hover:bg-line transition-colors disabled:opacity-50">
            취소
          </button>
          <button type="submit" form="device-form" disabled={!canSubmit || loading}
            className="h-10 px-5 rounded-full text-[14px] font-semibold
                       text-white bg-primary hover:bg-primary-dark transition-colors
                       disabled:opacity-40 flex items-center gap-1.5">
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor"
                  strokeWidth="3" strokeDasharray="30 60" />
              </svg>
            )}
            {isEdit ? '저장' : '추가'}
          </button>
        </div>
      }
    >
      <form id="device-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 장치명 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink">
            장치명 <span className="text-danger">*</span>
          </label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            disabled={loading} placeholder="예: 1층 조명 릴레이" className={inputClass} />
        </div>

        {/* IP 주소 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink">
            IP 주소 <span className="text-danger">*</span>
          </label>
          <input type="text" value={ip} onChange={e => setIp(e.target.value)}
            disabled={loading} placeholder="예: 192.168.1.100" className={inputClass} />
        </div>

        {/* 포트 / Slave ID */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink">포트</label>
            <input type="number" value={port} onChange={e => setPort(e.target.value)}
              disabled={loading} min={1} max={65535} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink">Slave ID</label>
            <input type="number" value={slaveId} onChange={e => setSlaveId(e.target.value)}
              disabled={loading} min={1} max={247} className={inputClass} />
          </div>
        </div>

        {/* 릴레이 주소 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink">
            릴레이 주소 <span className="text-danger">*</span>
          </label>
          <div className="flex gap-3">
            {ADDRESS_OPTIONS.map(opt => (
              <label key={opt.value}
                className={`flex flex-1 items-center justify-center h-[52px]
                  rounded-md border cursor-pointer text-[15px] font-medium
                  transition-colors select-none
                  ${address === opt.value
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-line bg-surface text-ink-2 hover:bg-canvas'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input type="radio" name="address" value={opt.value}
                  checked={address === opt.value}
                  onChange={() => setAddress(opt.value)}
                  disabled={loading} className="sr-only" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-2.5 text-[13px] text-danger">{error}</p>
        )}
      </form>
    </Modal>
  )
}
