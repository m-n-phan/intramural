import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Teams } from "./teams";
import { Schedule } from "./schedule";
import { Standings } from "./standings";
import { Settings } from "./settings";
import { MobileNav } from "./mobile-nav";

type DashboardView = 'overview' | 'sports' | 'teams' | 'schedule' | 'standings' | 'payments' | 'analytics' | 'roles' | 'settings';

export default function PlayerDashboard() {
    const [activeView, setActiveView] = useState<DashboardView>('teams');

    const renderView = () => {
        switch (activeView) {
            case 'teams': return <Teams />;
            case 'schedule': return <Schedule />;
            case 'standings': return <Standings />;
            case 'settings': return <Settings />;
            default: return <Teams />;
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
                <Sidebar activeView={activeView} setActiveView={setActiveView} />
                <div className="flex-1">{renderView()}</div>
            </div>
            <MobileNav activeView={activeView} setActiveView={setActiveView} />
        </>
    );
}