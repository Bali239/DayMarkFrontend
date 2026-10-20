"use client";

import { useState } from "react";
import { Modal, Typography } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;

export default function LogoutConfirmation({ onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);

  async function confirmLogout() {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  }

  return <Modal open centered title={<span className="inline-flex items-center gap-2"><LogoutOutlined className="text-rose-500" /> Sign out of Daymark?</span>} okText="Sign out" cancelText="Stay signed in" okButtonProps={{ danger: true, icon: <LogoutOutlined /> }} confirmLoading={busy} closable={!busy} mask={{ closable: !busy }} onCancel={onCancel} onOk={confirmLogout}>
    <Paragraph className="!mb-1 !text-slate-600">Your reminders will be here when you sign in again.</Paragraph>
  </Modal>;
}
