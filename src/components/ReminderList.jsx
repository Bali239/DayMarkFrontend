"use client";

import { Button, Card, Checkbox, Empty, Input, Pagination, Segmented, Spin, Tag, Typography } from "antd";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { dateLabel, timeLeftLabel } from "@/lib/reminders";

const { Paragraph, Text, Title } = Typography;

function ReminderRow({ item, now, onToggle, onEdit, onDelete }) {
  const categoryColor =
    { Personal: "purple", Work: "blue", Health: "green", Other: "default" }[item.category] ||
    "default";
  const timeIsPast = new Date(item.dueAt).getTime() < now;
  return (
    <article className="group flex flex-col gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:px-5">
      <Checkbox
        checked={item.completed}
        onChange={() => onToggle(item)}
        aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Text
            strong
            delete={item.completed}
            className={`!text-[0.95rem] ${item.completed ? "!text-slate-400" : "!text-slate-800"}`}
          >
            {item.title}
          </Text>
          <Tag color={categoryColor} className="!m-0 !rounded-full !px-2.5">
            {item.category}
          </Tag>
        </div>
        <Paragraph ellipsis={{ rows: 1 }} className="!mb-0 !mt-1 !text-sm !text-slate-500">
          {item.description || "No description added."}
        </Paragraph>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600 sm:w-40">
        <CalendarOutlined className="text-violet-600" />
        <div>
          {dateLabel(item)}
          {!item.completed && (
            <Text
              className={`!block !text-xs ${timeIsPast ? "!text-rose-600" : "!text-violet-600"}`}
            >
              {timeLeftLabel(item.dueAt, now)}
            </Text>
          )}
          <Text className="!block !text-xs !text-slate-400">
            {item.completed
              ? "Completed"
              : item.emailSuppressed
                ? "Test email disabled"
                : item.emailSentAt
                  ? "Email sent"
                  : "Email pending"}
          </Text>
        </div>
      </div>
      <div className="flex items-center gap-1 self-end sm:self-auto">
        <Button
          type="text"
          shape="circle"
          onClick={() => onEdit(item)}
          aria-label="Edit reminder"
          icon={<EditOutlined />}
        />
        <Button
          type="text"
          danger
          shape="circle"
          onClick={() => onDelete(item)}
          aria-label="Delete reminder"
          icon={<DeleteOutlined />}
        />
      </div>
    </article>
  );
}

export default function ReminderList({
  reminders,
  shown,
  total,
  loading,
  pagination,
  filter,
  setFilter,
  query,
  setQuery,
  setPage,
  setPageSize,
  onToggle,
  onEdit,
  onDelete,
  onNew,
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const listFilter = filter === "Overview" ? "Upcoming" : filter;
  const pageStart = (pagination.page - 1) * pagination.pageSize;

  return (
    <Card
      className="!mb-6 !overflow-hidden !rounded-2xl !border-slate-200/80 !shadow-sm !shadow-slate-900/[0.02]"
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <Text className="!text-xs !font-semibold !tracking-[0.15em] !text-violet-700">
            YOUR LIST
          </Text>
          <Title level={3} className="!mb-1 !mt-2">
            {listFilter === "Upcoming" ? "Coming up" : listFilter}
          </Title>
          <Text type="secondary">
            {listFilter === "Upcoming"
              ? "The things you want to make time for."
              : "A clear view of what’s on your plate."}
          </Text>
        </div>
        <Button
          type="link"
          className="!self-start !px-0 sm:!self-auto"
          onClick={() => setFilter("All reminders")}
        >
          View all <ArrowRightOutlined />
        </Button>
      </div>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Segmented
          options={["Upcoming", "All reminders", "Completed", "Overdue"]}
          value={listFilter}
          onChange={setFilter}
          className="max-w-full overflow-x-auto"
        />
        <Input
          aria-label="Search reminders"
          placeholder="Search reminders"
          prefix={<SearchOutlined />}
          allowClear
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="!w-full sm:!max-w-64"
        />
      </div>
      {loading ? (
        <div className="grid min-h-56 place-items-center" aria-live="polite">
          <Spin description="Loading reminders…" />
        </div>
      ) : shown.length ? (
        <div>
          {shown.map((item) => (
            <ReminderRow
              key={item.id}
              item={item}
              now={now}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="px-5 py-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text strong className="!block">
                  {query ? "No matching reminders" : "Nothing on this list"}
                </Text>
                <Text type="secondary">
                  {query
                    ? "Try another search."
                    : "Enjoy the breathing room, or add a reminder when something comes to mind."}
                </Text>
              </div>
            }
          >
            {!query && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
                Add a reminder
              </Button>
            )}
          </Empty>
        </div>
      )}
      <div className="flex justify-center border-t border-slate-100 px-3 py-4">
        <Pagination
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={[8, 16, 32]}
          showTotal={(itemTotal, range) => `${range[0]}–${range[1]} of ${itemTotal}`}
          onChange={(page, nextPageSize) => {
            if (nextPageSize !== pagination.pageSize) setPageSize(nextPageSize);
            else setPage(page);
          }}
        />
      </div>
      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>
          Showing{" "}
          <b className="text-slate-700">
            {total ? pageStart + 1 : 0}–{Math.min(pageStart + pagination.pageSize, total)}
          </b>{" "}
          of <b className="text-slate-700">{total}</b> reminders
        </span>
        <span className="inline-flex items-center gap-2">
          <CheckCircleFilled className="text-emerald-600" /> Synced with your account
        </span>
      </div>
    </Card>
  );
}
