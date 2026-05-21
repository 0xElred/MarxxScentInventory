import { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import Pagination from "../../components/layout/Pagination";
import DashboardService from "../../services/DashboardService";
import type { ActivityLog, DashboardStats } from "../../interfaces/DashboardInterface";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/table";
import Spinner from "../../components/Spinner/Spinner";
import { formatPeso } from "../../utils/formatPeso";
import { parsePaginated } from "../../utils/parsePaginated";

const StatCard = ({
    label,
    value,
    sub,
}: {
    label: string;
    value: string;
    sub?: string;
}) => (
    <div className="rounded-xl border border-slate-700 bg-[#152a4a] p-5">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        {sub && <p className="mt-1 text-xs text-green-500">{sub}</p>}
    </div>
);

const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsPage, setLogsPage] = useState(1);
    const [logsLastPage, setLogsLastPage] = useState(1);
    const [logsTotal, setLogsTotal] = useState(0);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const statsRes = await DashboardService.stats();
                if (statsRes.status === 200) setStats(statsRes.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        void loadStats();
    }, []);

    useEffect(() => {
        const loadLogs = async () => {
            setLogsLoading(true);
            try {
                const logsRes = await DashboardService.activityLogs(logsPage);
                if (logsRes.status === 200) {
                    const parsed = parsePaginated<ActivityLog>(logsRes.data, "logs");
                    setLogs(parsed.data);
                    setLogsLastPage(parsed.last_page);
                    setLogsTotal(parsed.total);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLogsLoading(false);
            }
        };
        void loadLogs();
    }, [logsPage]);

    return (
        <>
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your admin panel metrics"
            />
            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : (
                <>
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Total Products"
                            value={String(stats?.total_products ?? 0)}
                        />
                        <StatCard
                            label="Pending Orders"
                            value={String(stats?.pending_orders ?? 0)}
                        />
                        <StatCard
                            label="Sales This Month"
                            value={formatPeso(stats?.sales_this_month ?? 0)}
                            sub={`↗ ${stats?.sales_percent_change ?? 0}% from last month`}
                        />
                        <StatCard
                            label="Sales Last Month"
                            value={formatPeso(stats?.sales_last_month ?? 0)}
                        />
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-[#152a4a]">
                        <div className="border-b border-slate-700 px-5 py-4">
                            <h2 className="text-lg font-semibold text-white">Activity Logs</h2>
                            <p className="text-sm text-gray-400">
                                Latest actions performed across the admin panel (read-only)
                            </p>
                        </div>
                        {logsLoading ? (
                            <div className="flex justify-center py-12">
                                <Spinner size="md" />
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="border-b border-slate-700 bg-[#0f1f3d] text-xs uppercase text-gray-400">
                                            <TableRow>
                                                <TableCell isHeader className="px-5 py-3 text-left">
                                                    User
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-left">
                                                    Activity
                                                </TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-left">
                                                    When
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-800 text-sm text-gray-300">
                                            {logs.length > 0 ? (
                                                logs.map((log) => (
                                                    <TableRow
                                                        key={log.activity_log_id}
                                                        className="hover:bg-gray-900/50"
                                                    >
                                                        <TableCell className="px-5 py-3">
                                                            {log.user_name}
                                                        </TableCell>
                                                        <TableCell className="px-5 py-3">
                                                            {log.activity}
                                                        </TableCell>
                                                        <TableCell className="px-5 py-3 text-gray-400">
                                                            {log.time_ago ?? log.created_at}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        className="px-5 py-8 text-center text-gray-500"
                                                    >
                                                        No recent activity found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Pagination
                                    currentPage={logsPage}
                                    lastPage={logsLastPage}
                                    total={logsTotal}
                                    onPageChange={setLogsPage}
                                />
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default DashboardPage;
