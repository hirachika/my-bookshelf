"use client";

import { Button } from "@chakra-ui/react";

interface Props {
  value: number | null;
  onChange?: (rating: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export default function StarRating({ value, onChange, disabled = false, size = "sm" }: Props) {
  const starSize = size === "sm" ? "text-sm" : "text-xl";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Button
          key={star}
          unstyled
          type="button"
          onClick={() => !disabled && onChange?.(star === value ? 0 : star)}
          disabled={disabled}
          title={disabled ? "「読了」にすると評価できます" : `${star}点`}
          color={star <= (value ?? 0) ? "yellow.400" : "gray.200"}
          className={`leading-none transition-transform ${starSize} ${
            disabled ? "cursor-default opacity-30" : "cursor-pointer hover:scale-125"
          }`}
        >
          ★
        </Button>
      ))}
    </div>
  );
}
