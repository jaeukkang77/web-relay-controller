/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/auth/auth-store";
import { useRegions } from "../lib/hooks/region/useRegions";
import { useRegion } from "../lib/hooks/region/useRegion";
import { useDevices } from "../lib/hooks/device/useDevices";
import { useDeviceMutations } from "../lib/hooks/device/useDeviceMutations";
import DeviceCard, {
  DeviceCardSkeleton,
} from "../components/domain/device/DeviceCard";
import DeviceFormModal from "../components/domain/device/DeviceFormModal";
import type {
  DeviceDto,
  CreateDevicePayload,
  UpdateDevicePayload,
} from "../lib/api/device.api";
import { getImageUrl } from "../lib/utils/image-url";

// ── 공통: 장치 그리드 블록 ────────────────────────────────────
interface DeviceGridProps {
  regionId: number;
  isAdmin: boolean;
  onSchedule: (regionId: number, device: DeviceDto) => void;
  onEdit: (device: DeviceDto) => void;
  onDelete: (device: DeviceDto) => void;
}

function DeviceGrid({
  regionId,
  isAdmin,
  onSchedule,
  onEdit,
  onDelete,
}: DeviceGridProps) {
  const { data: devices, isLoading } = useDevices(regionId);
  const { controlRelay, syncDevice } = useDeviceMutations(regionId);
  const [relayLoadingId, setRelayLoadingId] = useState<number | null>(null);
  const [syncLoadingId, setSyncLoadingId] = useState<number | null>(null);

  const handleToggleRelay = (device: DeviceDto) => {
    if (relayLoadingId !== null) return;
    const action = device.isOn ? "off" : "on";
    setRelayLoadingId(device.id);
    controlRelay.mutate(
      { id: device.id, action },
      { onSettled: () => setRelayLoadingId(null) },
    );
  };

  const handleSync = (device: DeviceDto) => {
    if (syncLoadingId !== null) return;
    setSyncLoadingId(device.id);
    syncDevice.mutate(device.id, {
      onSettled: () => setSyncLoadingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <DeviceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-10 gap-2
                      bg-surface rounded-lg border border-line border-dashed"
      >
        <p className="text-[13px] text-ink-3">
          {isAdmin ? "장치를 추가해 주세요." : "등록된 장치가 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {devices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          isAdmin={isAdmin}
          relayLoading={relayLoadingId === device.id}
          syncLoading={syncLoadingId === device.id}
          onToggleRelay={handleToggleRelay}
          onSync={handleSync}
          onEdit={onEdit}
          onDelete={onDelete}
          onSchedule={() => onSchedule(regionId, device)}
        />
      ))}
    </div>
  );
}

// ── Admin 뷰 ─────────────────────────────────────────────────
function AdminDevicesView() {
  const navigate = useNavigate();
  const { data, isLoading: regionsLoading } = useRegions();
  const regions = data?.regions ?? [];

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DeviceDto | null>(null);

  const regionId = selectedRegionId ?? regions[0]?.id ?? 0;

  const { createDevice, updateDevice, deleteDevice } =
    useDeviceMutations(regionId);

  const handleFormSubmit = async (
    payload: CreateDevicePayload | UpdateDevicePayload,
  ) => {
    if (editTarget) {
      await new Promise<void>((resolve, reject) =>
        updateDevice.mutate(
          { id: editTarget.id, payload: payload as UpdateDevicePayload },
          {
            onSuccess: () => {
              setFormOpen(false);
              resolve();
            },
            onError: reject,
          },
        ),
      );
    } else {
      await new Promise<void>((resolve, reject) =>
        createDevice.mutate(payload as CreateDevicePayload, {
          onSuccess: () => {
            setFormOpen(false);
            resolve();
          },
          onError: reject,
        }),
      );
    }
  };

  const handleEdit = (device: DeviceDto) => {
    setEditTarget(device);
    setFormOpen(true);
  };

  const handleDelete = (device: DeviceDto) => {
    if (!confirm(`"${device.name}" 장치를 삭제하시겠습니까?`)) return;
    deleteDevice.mutate(device.id);
  };

  const handleSchedule = (rId: number, device: DeviceDto) => {
    navigate(`/regions/${rId}/devices/${device.id}/schedules`);
  };

  // 지역 선택된 값 — 초기값은 첫 지역
  const effectiveRegionId = selectedRegionId ?? regions[0]?.id ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
            장치 관리
          </h1>
          <p className="mt-1 text-[15px] text-ink-2">
            지역별 릴레이 장치를 제어합니다.
          </p>
        </div>
        {effectiveRegionId > 0 && (
          <button
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 h-[44px] rounded-full
                       bg-primary text-white text-[14px] font-semibold
                       hover:bg-primary-dark transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            장치 추가
          </button>
        )}
      </div>

      {/* 지역 탭 selector */}
      {regionsLoading ? (
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 bg-canvas rounded-full animate-pulse"
            />
          ))}
        </div>
      ) : regions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-[15px] text-ink-3">먼저 지역을 추가해 주세요.</p>
        </div>
      ) : (
        <>
          {/* 지역 탭 */}
          <div className="flex flex-wrap gap-2">
            {regions.map((r) => {
              const isSelected = effectiveRegionId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegionId(r.id)}
                  title={r.name}
                  className={`flex-shrink-0 transition-all overflow-hidden
                    h-9 px-4 rounded-full text-[13px] font-semibold
                         ${
                           isSelected
                             ? "bg-primary text-white"
                             : "bg-surface border border-line text-ink-2 hover:bg-canvas"
                         }`}
                >
                  {r.name}
                </button>
              );
            })}
          </div>

          {/* 선택된 지역 장치 목록 */}
          <DeviceGrid
            regionId={effectiveRegionId}
            isAdmin
            onSchedule={handleSchedule}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* 장치 추가/수정 모달 */}
      <DeviceFormModal
        open={formOpen}
        device={editTarget ?? undefined}
        loading={createDevice.isPending || updateDevice.isPending}
        onSubmit={handleFormSubmit}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}

// ── User 뷰 ──────────────────────────────────────────────────
function UserDevicesView({ regionId }: { regionId: number }) {
  const { data: region } = useRegion(regionId);
  const navigate = useNavigate();

  const handleEdit = (_: DeviceDto) => {}; // user는 edit 불가 (isAdmin=false라 버튼 숨김)
  const handleDelete = (_: DeviceDto) => {};

  const handleSchedule = (_rId: number, device: DeviceDto) => {
    navigate(`/regions/${regionId}/devices/${device.id}/schedules`);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 페이지 헤더 */}
      <div>
        {region &&
          (region.imagePath ? (
            <img
              src={getImageUrl(region.imagePath)!}
              alt={region.name}
              className="mt-2 h-10 max-w-[200px] object-contain"
            />
          ) : (
            <div>
              <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
                장치 제어
              </h1>
              <p className="mt-1 text-[15px] text-ink-2">{region.name}</p>
            </div>
          ))}
      </div>

      <DeviceGrid
        regionId={regionId}
        isAdmin={false}
        onSchedule={handleSchedule}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────
export default function DevicesPage() {
  const { isAdmin, user } = useAuth();

  if (isAdmin) {
    return <AdminDevicesView />;
  }

  // user는 반드시 regionId가 있음
  if (!user?.regionId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <p className="text-[15px] text-ink-3">
          연결된 지역이 없습니다. 관리자에게 문의하세요.
        </p>
      </div>
    );
  }

  return <UserDevicesView regionId={user.regionId} />;
}
