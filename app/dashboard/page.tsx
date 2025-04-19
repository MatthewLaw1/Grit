import Sidebar from "../components/sideBar";

export default function Dashboard() {
    return (
        <div className="flex flex-row h-screen">
            <Sidebar />
            <div className="flex-1 bg-[#F5F7FA] p-6">
                <div className="text-2xl font-bold mb-4">Dashboard</div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <p>Welcome to the dashboard!</p>
                </div>
            </div>
        </div>
    );
}