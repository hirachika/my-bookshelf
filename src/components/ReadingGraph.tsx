"use client";

import { useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from "recharts";
import type { Book } from "@/types/book";

function buildChartData(books: Book[]) {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const months: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ key, label: `${d.getMonth() + 1}月` });
  }

  const countByMonth: Record<string, number> = {};
  for (const b of books) {
    if (b.status !== "read" || !b.finishedAt) continue;
    const d = new Date(b.finishedAt);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    countByMonth[k] = (countByMonth[k] || 0) + 1;
  }

  const data = months.map(({ key, label }) => ({
    month: label,
    count: countByMonth[key] || 0,
    isCurrent: key === currentKey,
  }));

  const total = data.reduce((s, d) => s + d.count, 0);
  const avg = total / 12;
  const totalRead = books.filter((b) => b.status === "read").length;
  const thisYear = new Date().getFullYear();
  const thisYearRead = books.filter((b) => {
    if (b.status !== "read" || !b.finishedAt) return false;
    return new Date(b.finishedAt).getFullYear() === thisYear;
  }).length;

  return { data, avg, totalRead, thisYearRead };
}

type LabelProps = {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
};

const BarLabel = ({ x = 0, y = 0, width = 0, value = 0 }: LabelProps) => {
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 3} textAnchor="middle" fontSize={9} fill="#f97316">
      {value}冊
    </text>
  );
};

export default function ReadingGraph({ books }: { books: Book[] }) {
  const { data, avg, totalRead, thisYearRead } = useMemo(() => buildChartData(books), [books]);

  return (
    <Box bg="white" rounded="lg" p="12px" display="flex" flexDirection="column" gap="12px">
      <Text as="span" fontWeight="bold" color="gray.700">
        今年読み終わった本：{thisYearRead}冊
      </Text>
      <Flex gap="1rem" fontSize="sm" color="gray.500">
        <Text>これまでに読んだ本：{totalRead}冊</Text>
        <Text>月平均：{avg.toFixed(1)}冊</Text>
      </Flex>

      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 16, right: 0, left: 0, bottom: 0 }} barCategoryGap="25%">
          <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} label={<BarLabel />}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.isCurrent ? "#ea580c" : "#fdba74"} opacity={entry.isCurrent ? 1 : 0.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
