import { Button, Card, Select, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { notificationOptions, optionLabel } from "@/lib/reminders";

const { Text, Title } = Typography;

export default function DashboardFooter({ advance, onAdvance, pushNotifications }) {
  return (
    <>
      <section className="w-full">
        <Card className="w-full !rounded-2xl !border-slate-200/80" styles={{ body: { padding: 24 } }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-center">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <BellOutlined />
              </span>
              <div className="min-w-0 flex-1">
                <Text className="!text-xs !font-semibold !tracking-[0.15em] !text-violet-700">
                  EMAIL + PUSH NOTIFICATIONS
                </Text>
                <Title level={5} className="!mb-1 !mt-1">
                  A gentle heads-up
                </Title>
                <Text type="secondary" className="!block !whitespace-normal">
                  Email {optionLabel(advance).toLowerCase()} before a task is due, with optional
                  browser push.
                </Text>
              </div>
            </div>
            <Select
              aria-label="Reminder notification advance time"
              value={advance}
              onChange={onAdvance}
              options={notificationOptions.map((minutes) => ({
                value: minutes,
                label: optionLabel(minutes),
              }))}
              className="w-full sm:!w-auto"
            />
            <Button
              loading={pushNotifications.busy}
              onClick={
                pushNotifications.enabled ? pushNotifications.disable : pushNotifications.enable
              }
              className="w-full sm:!w-auto"
            >
              {pushNotifications.enabled ? "Disable push" : "Enable push"}
            </Button>
          </div>
        </Card>
      </section>
    </>
  );
}
