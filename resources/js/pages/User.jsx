import {useState, useEffect} from 'react';
import axios from 'axios';
import { getUsers } from '../services/usersService';

export default function User() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsersData = async () => {
            try {
                const response = await getUsers();
                const {data} = response;
                setUsers(data.users);
                console.log(data.users);
            }
            catch(e) {
                console.error(e);
            }
        }

        getUsersData();
    }, [])

    return(
        <div>
            <h1>Hello Cynthia from User</h1>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.name} - {user.email}</li>
                ))}
            </ul>
        </div>
    )
}