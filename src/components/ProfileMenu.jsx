"use client";

import { useState } from "react";
import { Avatar, Dropdown, Typography } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import LogoutConfirmation from "@/components/LogoutConfirmation";

const { Text } = Typography;

export default function ProfileMenu({ user, initials, onLogout }) {
  const [confirming, setConfirming] = useState(false);
  const items = [
    {
      key: "account",
      label: (
        <div className="max-w-56 py-1">
          <Text strong className="!block truncate">
            {user.name}
          </Text>
          <Text type="secondary" className="!block truncate !text-xs">
            {user.email}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { key: "logout", label: "Log out", icon: <LogoutOutlined />, danger: true },
  ];

  return (
    <>
      <Dropdown
        menu={{
          items,
          onClick: ({ key }) => {
            if (key === "logout") setConfirming(true);
          },
        }}
        trigger={["click"]}
        placement="bottomRight"
      >
        <button
          className="flex size-10 items-center justify-center rounded-full ring-2 ring-white transition hover:ring-violet-200 focus-visible:outline-2 focus-visible:outline-violet-500"
          type="button"
          title={`Account menu for ${user.name}`}
          aria-label={`Open account menu for ${user.name}`}
        >
          <Avatar
            src={user.picture || undefined}
            icon={!user.picture ? <UserOutlined /> : undefined}
            className="!bg-violet-100 !font-semibold !text-violet-800"
          >
            {!user.picture && initials}
          </Avatar>
        </button>
      </Dropdown>
      {confirming && (
        <LogoutConfirmation onCancel={() => setConfirming(false)} onConfirm={onLogout} />
      )}
    </>
  );
}
