import { Autocomplete, Paper, Stack, Text, Title } from "@mantine/core";
import { useT } from "@hooks";
import { useManageOfficeFormContext } from "../../../components/office/ManageOfficeModal/ManageOfficeFormContext";
import { MapPreview } from "../../../components/MapPreview";
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

  const mapStyle = { borderRadius: 8, minHeight: 200, maxHeight: 400 };
  const address = form.getValues().address || office?.address || "";

  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="xs">
        <Title order={4}>
          {t("office.overview.officesListHeader.address")}
        </Title>
        {editing ? (
          <>
            <Autocomplete
              key={form.key("address")}
              placeholder={t(
                "office.createOfficeModal.fields.addressPlaceholder"
              )}
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
