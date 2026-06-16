"use client";

import { DatePicker, InputGroup, parseDate } from "@chakra-ui/react";
import type { DateValue } from "@chakra-ui/react";
import { RiCalendarLine } from "react-icons/ri";

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  width?: string;
}

export default function FinishedAtPicker({ value, onChange, disabled = false, width = "100%" }: Props) {
  const parsed: DateValue[] = value ? [parseDate(value.slice(0, 10))] : [];

  const handleChange = (details: { value: DateValue[] }) => {
    const v = details.value[0];
    onChange(v ? v.toString() : null);
  };

  return (
    <DatePicker.Root
      key={value ?? "empty"}
      value={parsed}
      onValueChange={handleChange}
      disabled={disabled}
      locale="ja-JP"
      colorPalette="orange"
      positioning={{ placement: "bottom-start" }}
      width={width}
    >
      <DatePicker.Control>
        <InputGroup
          endElement={
            <DatePicker.Trigger color="gray.400" _hover={{ color: "orange.500" }}>
              <RiCalendarLine />
            </DatePicker.Trigger>
          }
        >
          <DatePicker.Input p="1" fontSize="sm" color="gray.700" />
        </InputGroup>
      </DatePicker.Control>
      <DatePicker.Positioner>
        <DatePicker.Content>
          <DatePicker.View view="day">
            <DatePicker.Header />
            <DatePicker.DayTable />
          </DatePicker.View>
          <DatePicker.View view="month">
            <DatePicker.Header />
            <DatePicker.MonthTable />
          </DatePicker.View>
          <DatePicker.View view="year">
            <DatePicker.Header />
            <DatePicker.YearTable />
          </DatePicker.View>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </DatePicker.Root>
  );
}
