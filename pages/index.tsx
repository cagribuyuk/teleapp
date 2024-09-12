import React from 'react';
import ServiceMap from '../components/ServiceMap';
import ServiceList from '../components/ServiceList';
import Header from '../components/Header';
import Chat from '../pages/api/chat/page';

const Dashboard: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-white">
            <Header>
                <ServiceMap />
            </Header>
            <main className="flex-1 pb-8">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-8">
                        <div className="w-full mt-[32px]">
                            <ServiceList />
                        </div>
                        <div className="mt-8">
                            <Chat />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
