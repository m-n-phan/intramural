import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Overview } from "./overview";
import { Analytics } from "./analytics";
import { Payments } from "./payments";
import { RoleManagement } from "./role-management";
import { Sports } from "./sports";

type AdminView = 'overview' | 'sports' | 'analytics' | 'payments' | 'roles';

export default function AdminDashboard() {
    const [activeView, setActiveView] = useState<AdminView>('overview');

    const renderView = () => {
        switch (activeView) {
            case 'overview': return <Overview />;
            case 'sports': return <Sports />;
            case 'analytics': return <Analytics />;
            case 'payments': return <Payments />;
            case 'roles': return <RoleManagement />;
            default: return <Overview />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 flex gap-6">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1">{renderView()}</div>
        </div>
    );
}