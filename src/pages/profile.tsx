// pages/profile.tsx

import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import styles from "@/styles/Profile.module.css";
import { useUser } from "@thirdweb-dev/react";

const Profile = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState(null);

  // Handler after successful form submission
  const handleProfileSubmit = (data) => {
    setProfileData(data);
    // You can perform additional actions here, such as redirecting or displaying a success message
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Профиль организации</h1>
      <ProfileForm onSubmit={handleProfileSubmit} />
      {profileData && (
        <div className={styles.successMessage}>
          <p>Профиль успешно обновлен!</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
