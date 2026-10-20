import { Button, Card, Col, Progress, Row, Statistic, Typography } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Paragraph, Text, Title } = Typography;

export function DashboardHeading({ user, onNew }) {
  const username = user?.name || "here";
  return (
    <div className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Text className="!text-xs !font-semibold !tracking-[0.15em] !text-violet-700">
          {new Date()
            .toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })
            .toUpperCase()}
        </Text>
      
        <Paragraph className="!mb-0 !text-slate-600">
          Welcome back, {username}!. Here’s what’s on your mind.
        </Paragraph>
      </div>
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        onClick={onNew}
        className="!w-full !rounded-xl !font-semibold sm:!w-auto"
      >
        New reminder
      </Button>
    </div>
  );
}

export function ReminderStats({ stats }) {
  const total = stats.completed + stats.upcoming + stats.overdue;
  const percentage = total ? Math.round((stats.completed / total) * 100) : 0;
  const cards = [
    {
      label: "Upcoming",
      value: stats.upcoming,
      note: `${stats.today} scheduled for today`,
      icon: <ClockCircleOutlined />,
      color: "text-violet-700",
      bg: "bg-violet-50",
    },
    {
      label: "Completed",
      value: stats.completed,
      note: "Tasks you’ve finished",
      icon: <CheckCircleOutlined />,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      note: "Ready when you are",
      icon: <ExclamationCircleOutlined />,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
  ];
  return (
    <Row gutter={[14, 14]} className="!mb-7" aria-label="Reminder statistics">
      {cards.map((card) => (
        <Col key={card.label} xs={24} sm={12} xl={6}>
          <Card
            className="h-full !rounded-2xl !border-slate-200/80 !shadow-sm !shadow-slate-900/[0.02]"
            styles={{ body: { padding: 20 } }}
          >
            <div className="mb-5 flex items-start justify-between">
              <Text className="!text-sm !font-medium !text-slate-500">{card.label}</Text>
              <span
                className={`grid size-9 place-items-center rounded-xl ${card.bg} ${card.color}`}
              >
                {card.icon}
              </span>
            </div>
            <Statistic
              value={card.value}
              styles={{
                content: {
                  color: "#172033",
                  fontSize: 30,
                  fontWeight: 650,
                  letterSpacing: "-0.04em",
                },
              }}
            />
            <Text className="!mt-2 !block !text-xs !text-slate-500">{card.note}</Text>
          </Card>
        </Col>
      ))}
      <Col xs={24} sm={12} xl={6}>
        <Card
          className="h-full !rounded-2xl !border-slate-200/80 !shadow-sm !shadow-slate-900/[0.02]"
          styles={{ body: { padding: 20 } }}
        >
          <div className="flex h-full items-center justify-between gap-3">
            <div>
              <Text className="!text-xs !font-semibold !tracking-wider !text-slate-500">
                COMPLETION RATE
              </Text>
              <Title level={3} className="!mb-1 !mt-2">
                {percentage}%
              </Title>
              <Text className="!text-xs !text-slate-500">Your reminders, at a glance.</Text>
            </div>
            <Progress
              type="circle"
              percent={percentage}
              size={66}
              strokeColor="#6d59b0"
              railColor="#eeeaf6"
              format={() => <CheckCircleOutlined className="text-violet-700" />}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
}
