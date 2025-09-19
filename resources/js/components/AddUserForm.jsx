import { useForm } from "react-hook-form";
import { addUser } from "../services/usersService";

export default function AddUserForm() {
    const { register, handleSubmit, formState: {errors}, setError} = useForm({mode: "onChange"});

    const processData = async (data) => {
        alert(JSON.stringify(data));
        try {
            const response = await addUser(data);
            console.log(response)
        }
        catch(error) {
            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors;
                // map each field error into RHF
                Object.entries(serverErrors).forEach(([field, messages]) => {
                  setError(field, {
                    type: "server",
                    message: messages[0], // Laravel always sends an array
                  });
                });
              } else {
                console.error(error);
              }
        }
    }

    return(
        <form onSubmit={handleSubmit(processData)}>
            <h1>Hello Patrick from AddUserForm</h1>
            <section>
                <label>First Name</label>
                <input type="text" {...register("first_name", {
                    required: true
                })} />
                {errors.first_name && <span>{errors.first_name.message}</span>}
            </section>

            <section>
                <label>Last Name</label>
                <input type="text" {...register("last_name", {
                    required: true
                })} />
                {errors.last_name && <span>{errors.last_name.message}</span>}
            </section>

            <section>
                <label>Email</label>
                <input type="email" {...register("email", {
                    required: true
                })} />
                {errors.email && <span>{errors.email.message}</span>}
            </section>
            

            <button type="submit">Submit</button>
        </form>
    )
}