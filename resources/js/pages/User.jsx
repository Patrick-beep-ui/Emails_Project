import {useState, useEffect} from 'react';
import axios from 'axios';

export default function User() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await axios.get('/api/users');
                const {data} = response;
                setUsers(data.users);
                console.log(data.users);
            }
            catch(e) {
                console.error(e);
            }
        }

        getUsers();
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