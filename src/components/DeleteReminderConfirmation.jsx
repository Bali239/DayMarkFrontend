"use client";

import { useState } from "react";
import { Modal, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Paragraph, Text } = Typography;

export default function DeleteReminderConfirmation({ reminder, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    setBusy(true);
    const deleted = await onConfirm(reminder);
    setBusy(false);
    if (deleted) onCancel();
  }

  return <Modal
    open
    centered
    title={<span className="inline-flex items-center gap-2"><DeleteOutlined className="text-rose-500" /> Delete this reminder?</span>}
    okText="Delete reminder"
    cancelText="Keep reminder"
    okButtonProps={{ danger: true, icon: <DeleteOutlined /> }}
    confirmLoading={busy}
    closable={!busy}
    mask={{ closable: !busy }}
    onCancel={onCancel}
    onOk={confirmDelete}
  >
    <Paragraph className="!mb-1 !text-slate-600">Are you sure you want to delete <Text strong>“{reminder.title}”</Text>? This action can’t be undone.</Paragraph>
  </Modal>;
}
