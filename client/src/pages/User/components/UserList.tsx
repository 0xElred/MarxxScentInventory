import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/table";
import UserService from "../../../services/UserService";
import Spinner from "../../../components/Spinner/Spinner";
import type { UserColumns } from "../../../interfaces/UserInterface";
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput";

interface UserListProps {
    onAddUser: () => void;
    onEditUser: (user: UserColumns | null) => void
    onDeleteUser: (user: UserColumns | null) => void
    refreshKey: boolean;
    reloadKey?: number;
}

const UserList: FC<UserListProps> = ({ onAddUser, onEditUser, onDeleteUser, refreshKey }) => {
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [users, setUsers] = useState<UserColumns[]>([]);
    const [usersTableCurrentPage, setUsersTableCurrentPage] = useState(1);
    const [, setUsersTableLastPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] =useState('') 

    const tableRef = useRef<HTMLDivElement>(null);

    const handleLoadUsers = useCallback(async (page: number, append = false, searchQuery: string) => {
        try {
            setLoadingUsers(true);

            const res = await UserService.loadUsers(page, searchQuery);

            if (res.status === 200) {
                const usersData = res.data.users.data || res.data.users || [];
                const lastPage =
                    res.data.users.last_page || res.data.last_page || 1;

                setUsers((prev) => (append ? [...prev, ...usersData] : usersData));
                setUsersTableCurrentPage(page);
                setUsersTableLastPage(lastPage);
                setHasMore(page < lastPage);
            } else {
                setUsers((prev) => (append ? prev : []));
                setHasMore(false);
            }
        } catch (error) {
            console.error('Unexpected Server error during loading Users: ', error);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    const handleScroll = useCallback(() => {
        const ref = tableRef.current;

        if (
            ref &&
            ref.scrollTop + ref.clientHeight >= ref.scrollHeight - 10 &&
            hasMore &&
            !loadingUsers
        ) {
            handleLoadUsers(usersTableCurrentPage + 1, true, debouncedSearch);
        }
    }, [hasMore, loadingUsers, usersTableCurrentPage, debouncedSearch, handleLoadUsers]);


    const handleUserFullNameFormat = (user: UserColumns) => {
        let fullName =  ''
        if (user.middle_name) {
            fullName = `${user.last_name}, ${user.first_name}, ${user.middle_name.charAt(0)}.`;
        } else {
            fullName = `${user.last_name}, ${user.first_name}`;
        }
        if (user.suffix_name) {
            fullName += ` ${user.suffix_name}`;
        }
        return fullName;
    };

    useEffect(() => {
        const ref = tableRef.current

        if(ref){
            ref.addEventListener('scroll', handleScroll);
        }
        
        return () => {
            if(ref) {
                ref.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 800);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setUsers([]);
        setUsersTableCurrentPage(1);
        setHasMore(true);

        // Must load page 1 here: `setUsersTableCurrentPage(1)` does not update
        // `usersTableCurrentPage` until the next render, so using that variable
        // would re-fetch whatever page was last (e.g. after infinite scroll),
        // replacing the list with a different slice of users.
        void handleLoadUsers(1, false, debouncedSearch);
        if (tableRef.current) {
            tableRef.current.scrollTop = 0;
        }
    }, [refreshKey, debouncedSearch, handleLoadUsers]);

    return (
        <>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div 
                    ref={tableRef}
                    className="relative max-full max-h-[calc(100vh-8.5rem)] overflow-x-auto">
                    <Table>
                        <caption className="mb-4">
                            <div className="border-b border-gray-100">
                                <div className="p-4 flex justify-between">
                                    <div className="w-64">
                                        <FloatingLabelInput label="Search" type="text" name="search" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
                                    </div>
                                    <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition cursor-pointer" onClick={onAddUser}>
                                        Add User </button>
                                </div>
                            </div>
                        </caption>
                        <TableHeader className="border-b border-gray-200 bg-blue-500 sticky top-0 text-white text-xs z-10">
                            <TableRow > 
                                <TableCell isHeader className=" px-5 py-3 font-medium text-center ">No.
                                </TableCell>

                                <TableCell isHeader colSpan={2} className=" px-5 py-3 font-medium text-center ">Full Name
                                </TableCell>

                                <TableCell isHeader className=" px-5 py-3 font-medium text-center ">Gender
                                </TableCell>

                                <TableCell isHeader className=" px-5 py-3 font-medium text-center ">Birth Date
                                </TableCell>

                                <TableCell isHeader className=" px-5 py-3 font-medium text-center ">Age
                                </TableCell>

                                <TableCell isHeader className=" px-5 py-3 font-medium text-start ">Action

                                </TableCell>

                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 text-gray-600 text-sm ">
                            {(users.length ?? 0) > 0 ? (
                                users.map((user, index) =>(
                                    <TableRow className="hover:bg-gray-100" key={user.user_id}>
                                        <TableCell className="px-4 py-3 text-center">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="py-3 items-end justify-end">
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt={handleUserFullNameFormat(user)} className="object-cover w-10 h-10 rounded-full" />
                                            ) : (
                                                <div className="relative inline-flex items-center justify-center w-10 h-10 text-center text-sm overflow-hidden bg-gray-300 rounded-full">
                                                    <span className="font-medium text-gray-600">
                                                        {`${user.last_name.charAt(0)}${user.first_name.charAt(0)}`}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {handleUserFullNameFormat(user)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {user.gender?.gender ?? "—"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {user.birth_date}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {user.age}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <div className="flex  gap-4">
                                            <button type="button" className="text-green-600 hover:underline" onClick={() => onEditUser(user)}> Edit</button>
                                            <button type="button" className="text-red-600 hover:underline" onClick={() => onDeleteUser(user)}>Delete</button>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))
                            ) : !loadingUsers &&(users.length ?? 0) <= 0 ? (
                               <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-4 text- font-medium"> 
                                        No Records Found
                                    </TableCell>
                                </TableRow> 
                            ) : <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-4 text-center"> 
                                    <Spinner size="md"/>
                                    </TableCell>
                                </TableRow>}

                            {loadingUsers && (users.length ?? 0) > 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-4 text-center"> 
                                    <Spinner size="md"/>
                                    </TableCell>
                                </TableRow>
                            )}
                           
                        </TableBody>

                    </Table>
                </div>
            </div>
        </>
    )
}

export default UserList;