import React from "react";
import "./styles/profile.css";
import { useUser } from "./UserContext";

const Profile = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState({});

  const fetchUserDetails = async () => {
    try {
      const docRef = doc(db, "users", user);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.log("Error getting document:", error);
    }

  }
  useEffect(()=>{
    fetchUserDetails();
  })
  return (
    <div className="profile">
      <h1>Profile</h1>
      <i class="bx bx-user-circle"></i>
      <p>Name: {user.name}</p>
    </div>
  );
};

export default Profile;
