"use client";

import { useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from "recharts";
import type { Book } from "@/types/book";

const PIE_COLORS = [
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#fcd34d",
  "#86efac",
  "#67e8f9",
  "#a5b4fc",
  "#f9a8d4",
  "#c4b5fd",
  "#99f6e4",
  "#fda4af",
  "#bbf7d0",
  "#e9d5ff",
];

const CATEGORY_MAP: { label: string; keywords: RegExp }[] = [
  { label: "小説・フィクション", keywords: /fiction|novel|小説|sf|mystery|fantasy|romance|horror|thriller|literary/i },
  {
    label: "ビジネス・経済",
    keywords: /business|economics|management|finance|marketing|accounting|entrepreneur|ビジネス|経済/i,
  },
  { label: "自己啓発", keywords: /self.?help|personal development|motivation|success|mind|mental|自己啓発/i },
  { label: "心理学", keywords: /psychology|psycholog|psychiatry|cognitive|behavioral|心理|精神/i },
  { label: "技術・IT", keywords: /computer|technology|programming|science|engineering|software|math|network|技術|IT/i },
  { label: "伝記・自叙伝", keywords: /biography|autobiography|memoir|伝記|自叙伝/i },
  { label: "エッセイ", keywords: /essay|essays|エッセイ|随筆/i },
  { label: "哲学", keywords: /philosophy|philosophical|ethics|哲学|倫理/i },
  { label: "歴史・社会", keywords: /history|social|politics|religion|culture|sociology|歴史|社会/i },
  { label: "健康", keywords: /health|medical|fitness|nutrition|wellness|diet|健康|医療|栄養/i },
  { label: "芸術・デザイン", keywords: /art|design|music|photography|architecture|craft|fashion/i },
  { label: "子ども・教育", keywords: /child|education|juvenile|comic|manga|子ども|教育/i },
];

function mapCategory(raw: string): string {
  for (const { label, keywords } of CATEGORY_MAP) {
    if (keywords.test(raw)) return label;
  }
  return "その他";
}

function buildCategoryData(books: Book[]) {
  const counts: Record<string, number> = {};
  for (const b of books) {
    const cats = b.categories?.length ? b.categories : ["その他"];
    const mapped = mapCategory(cats[0]);
    counts[mapped] = (counts[mapped] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

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
  const categoryData = useMemo(() => buildCategoryData(books), [books]);

  return (
    <Box display="flex" flexDirection="column" gap="4">
      <Box bg="white" rounded="lg" py="4" px="2" display="flex" flexDirection="column" gap="1">
        <Text as="span" fontWeight="bold" color="gray.700">
          今年読み終わった本：{thisYearRead}冊
        </Text>
        <Box fontSize="sm" color="gray.500">
          <Text>これまでに読んだ本：{totalRead}冊</Text>
          <Text>月平均：{avg.toFixed(1)}冊</Text>
        </Box>

        <ResponsiveContainer width="100%" height={130} style={{ outline: "none" }}>
          <BarChart data={data} margin={{ top: 16, right: 0, left: 0, bottom: 0 }} barCategoryGap="25%">
            <XAxis
              dataKey="month"
              tick={{ fontSize: 7, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} label={<BarLabel />}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.isCurrent ? "#ea580c" : "#fdba74"} opacity={entry.isCurrent ? 1 : 0.5} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {categoryData.length > 0 && (
        <Box bg="white" rounded="lg" py="4" px="2">
          <Text as="span" fontWeight="bold" color="gray.700">
            カテゴリ別
          </Text>
          <Box fontSize="sm" color="gray.500">
            <Text>あなたが一番よく読むカテゴリ：{categoryData[0].name}</Text>
          </Box>

          <ResponsiveContainer width="100%" height={260} style={{ outline: "none" }}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ percent }: { percent?: number }) => percent ? `${(percent * 100).toFixed(0)}%` : ""}
                labelLine={false}
                fontSize={10}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}冊`, name]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}
