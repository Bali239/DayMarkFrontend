import { Breadcrumb, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import ProfileMenu from "@/components/ProfileMenu";

const { Text } = Typography;

export default function TopBar({ filter, user, initials, onLogout }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-[#fbfaf8]/90 px-4 backdrop-blur sm:px-7 lg:px-10">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white md:hidden">
          ✳
        </span>
        <Breadcrumb items={[{ title: "Workspace" }, { title: filter }]} />
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <Text className="!hidden !items-center !gap-2 !text-xs !text-slate-500 sm:!inline-flex">
          <CheckCircleOutlined className="!text-emerald-600" />
          {user.emailVerified ? "Verified Google account" : user.email}
        </Text>
        <ProfileMenu user={user} initials={initials} onLogout={onLogout} />
      </div>
    </header>
  );
}
