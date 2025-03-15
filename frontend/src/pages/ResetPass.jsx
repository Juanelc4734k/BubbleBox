import React from 'react'
import { useSearchParams, Link } from 'react-router-dom';
import ResetPassComponent from '../components/auth/ResetPassComponent';

const ResetPass = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    return (
        <div>
            <ResetPassComponent token={token} />
        </div>
    );
};

export default ResetPass;