import * as React from 'react';

interface EmailTemplateProps {
    firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h1 style={{ color: '#333' }}>Welcome to ProTribe, {firstName}!</h1>
            <p>We're excited to have you on board.</p>
        </div>
    );
}