import { Group } from "@mantine/core";
import { OfficeHoursTemplateDto } from "@clinio/api";
import { OfficeDetailAddress } from "./components/OfficeDetailAddress.tsx";
import { OfficeDetailHours } from "./components/OfficeDetailHours.tsx";
import { OfficeDetailPersonnel } from "./components/OfficeDetailPersonnel.tsx";
import { useOfficeDetailContext } from "./useOfficeDetailContext.ts";

export function OfficeDetailContent() {
  const {
    office,
    editing,
    suggestions,
    mapPosition,
    handleAddressSelect,
    users,
    watchedStaffIds,
    selectedRole,
    selectedUserId,
    roleSelectData,
    userSelectData,
    handleRoleChange,
    setSelectedUserId,
    handleAddStaff,
    handleRemoveStaff,
  } = useOfficeDetailContext();

  return (
    <>
      <OfficeDetailAddress
        office={office}
        editing={editing}
        suggestions={suggestions}
        mapPosition={mapPosition}
        onAddressSelect={handleAddressSelect}
      />

      <Group align="stretch" wrap="wrap" gap="md">
        <OfficeDetailHours
          template={
            office
              ? (office.officeHoursTemplate as OfficeHoursTemplateDto)
              : null
          }
          editing={editing}
        />

        <OfficeDetailPersonnel
          editing={editing}
          users={users}
          staffIds={editing ? watchedStaffIds : office?.staffIds ?? []}
          selectedRole={selectedRole}
          selectedUserId={selectedUserId}
          roleSelectData={roleSelectData}
          userSelectData={userSelectData}
          onRoleChange={handleRoleChange}
          onUserChange={setSelectedUserId}
          onAddStaff={handleAddStaff}
          onRemoveStaff={handleRemoveStaff}
        />
      </Group>
    </>
  );
}
