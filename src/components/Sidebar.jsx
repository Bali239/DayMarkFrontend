"use client";

import { Button, Tooltip, Typography } from "antd";
import {
  AppstoreOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import Brand from "@/components/Brand";

const { Text } = Typography;
const navItems = [
  { filter: "Overview", icon: <AppstoreOutlined />, label: "Overview", count: "upcoming" },
  { filter: "Upcoming", icon: <ClockCircleOutlined />, label: "Upcoming", selected: true },
  { filter: "Completed", icon: <CheckOutlined />, label: "Completed" },
  { filter: "Overdue", icon: <HistoryOutlined />, label: "Overdue", count: "overdue" },
];

export default function Sidebar({ filter, setFilter, stats, onNew }) {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-t-0 md:px-4 md:py-6">
      <div className="hidden px-2 pb-8 md:block">
        <Brand />
      </div>
      <Text className="!hidden !px-3 !pb-2 !text-[0.65rem] !font-semibold !tracking-[0.16em] !text-slate-400 md:!block">
        WORKSPACE
      </Text>
      <nav
        className="flex w-full items-center justify-around gap-1 md:flex-col md:items-stretch md:justify-start"
        aria-label="Main navigation"
      >
        {navItems.map((item, index) => {
          const selected = filter === item.filter;
          return (
            <Tooltip
              key={`${item.label}-${index}`}
              title={item.label}
              placement="right"
              className="md:hidden"
            >
              <Button
                type={selected ? "default" : "text"}
                icon={item.icon}
                onClick={() => setFilter(item.filter)}
                aria-pressed={selected}
                className={`!h-11 !min-w-11 !rounded-xl md:!h-11 md:!w-full md:!justify-start md:!px-3 ${selected ? "!border-violet-100 !bg-violet-50 !font-semibold !text-violet-800" : "!border-transparent !text-slate-600 hover:!bg-slate-50"}`}
              >
                <span className="hidden md:inline">{item.label}</span>
                {item.count && (
                  <span className="ml-auto hidden rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 md:inline">
                    {stats[item.count]}
                  </span>
                )}
              </Button>
            </Tooltip>
          );
        })}
        <Button
          type={filter === "All reminders" ? "default" : "text"}
          icon={<UnorderedListOutlined />}
          onClick={() => setFilter("All reminders")}
          aria-pressed={filter === "All reminders"}
          className={`!h-11 !min-w-11 !rounded-xl md:!w-full md:!justify-start md:!px-3 ${filter === "All reminders" ? "!border-violet-100 !bg-violet-50 !font-semibold !text-violet-800" : "!border-transparent !text-slate-600 hover:!bg-slate-50"}`}
        >
          <span className="hidden md:inline">All reminders</span>
        </Button>
      </nav>
    </aside>
  );
}
