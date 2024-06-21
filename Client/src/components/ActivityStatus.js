import React, { useEffect } from 'react';
import axios from 'axios';

const ActivityStatus = ({ children }) => {
    // Function to update last activity time
    const updateLastActivity = async () => {
        try {
            // Send request to backend API to update last activity
            await axios.put(`${process.env.REACT_APP_API_URL}/api/users/update-last-activity`);
        } catch (error) {
            console.error('Error updating last activity:', error);
        }
    };

    // Set up interval timer to update last activity every minute
    useEffect(() => {
        const intervalId = setInterval(updateLastActivity, 60000); // Update every minute (60000 milliseconds)
        
        // Clean up interval timer when component unmounts
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            {/* Render children components */}
            {children}
        </div>
    );
};

export default ActivityStatus;