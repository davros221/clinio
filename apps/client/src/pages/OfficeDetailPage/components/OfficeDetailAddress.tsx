import { Autocomplete, Paper, Stack, Text, Title } from "@mantine/core";
import { useT } from "@hooks";
import { useManageOfficeFormContext } from "../../../components/office/ManageOfficeForm/ManageOfficeFormContext";
import { MapPreview } from "../../../components/common/MapPreview";
import { Office } from "@clinio/api";

type Props = {
  office: Office | null;
  editing: boolean;
  suggestions: Array<{ name: string; location: string }>;
  mapPosition: { lon: number; lat: number } | null;
  onAddressSelect: (value: string) => void;
};

export function OfficeDetailAddress({
  office,
  editing,
  suggestions,
  mapPosition,
  onAddressSelect,
}: Props) {
  const t = useT();
  const form = useManageOfficeFormContext();

  const mapStyle = {
    borderRadius: "var(--mantine-radius-md)",
    minHeight: 200,
    maxHeight: 400,
  };
  const address = form.getValues().address || office?.address || "";

  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder>
      <Stack gap="xs">
        <Title order={4}>
          {t("office.overview.officesListHeader.address")}
        </Title>
        {editing ? (
          <>
            <Autocomplete
              key={form.key("address")}
              aria-label={t("office.overview.officesListHeader.address")}
              placeholder={t("office.form.fields.addressPlaceholder")}
              {...form.getInputProps("address")}
              data={suggestions.map((s) => `${s.name}, ${s.location}`)}
              onOptionSubmit={onAddressSelect}
            />
            {mapPosition ? (
              <MapPreview
                lon={mapPosition.lon}
                lat={mapPosition.lat}
                style={mapStyle}
              />
            ) : address ? (
              <MapPreview
                address={address}
                title={`Map: ${address}`}
                style={mapStyle}
              />
            ) : null}
          </>
        ) : (
          <>
            <Text>{office?.address}</Text>
            {office?.address && (
              <MapPreview
                address={office.address}
                title={`Map: ${office.address}`}
                style={mapStyle}
              />
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
