
import Button from "@mui/material/Button";


const AccountPage = () => {

  return (
    <div className="items-center text-center">
        <h1 className ="text-3xl text-center mt-4 border-b-2 py-4">Account Home</h1>

        <button className='py-1 mt-4 px-3'>
        <Button variant="contained">Logout</Button>
        </button>
    </div>
  )
}

export default AccountPage