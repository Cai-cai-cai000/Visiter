import { Application } from './types';

export const INITIAL_APPLICATIONS: Application[] = [
    {
        id: 'VS20240613001',
        applicationDate: '2024-06-13 08:30',
        visitDate: '2024-06-14',
        startTime: '09:00',
        duration: 2,
        location: '行政楼301会议室',
        purpose: '商务洽谈',
        maxVisitors: 5,
        validDays: 1,
        status: 'Pending',
        visitors: [
            { id: 'v1', name: '王建国', phone: '13800138000', idType: 'id-card', idNumber: '110101198001011234' },
            { id: 'v2', name: '李晓明', phone: '13900139000', idType: 'id-card', idNumber: '110101199002025678' }
        ]
    },
    {
        id: 'VS20240613002',
        applicationDate: '2024-06-12 16:45',
        visitDate: '2024-06-13',
        startTime: '14:00',
        duration: 4,
        location: '实验楼2楼实验室',
        purpose: '学术交流',
        maxVisitors: 3,
        validDays: 1,
        status: 'Approved',
        visitors: [
            { id: 'v3', name: 'Sarah Jones', phone: '15000150000', idType: 'passport', idNumber: 'E12345678' }
        ]
    },
    {
        id: 'VS20240612001',
        applicationDate: '2024-06-11 14:30',
        visitDate: '2024-06-12',
        startTime: '10:00',
        duration: 1,
        location: '图书馆4楼阅览区',
        purpose: '参观访问',
        maxVisitors: 2,
        validDays: 1,
        status: 'Expired',
        visitors: [
            { id: 'v4', name: '赵铁柱', phone: '13700137000', idType: 'id-card', idNumber: '320102198505054321' }
        ]
    },
    {
        id: 'VS20240612002',
        applicationDate: '2024-06-11 10:15',
        visitDate: '2024-06-12',
        startTime: '09:00',
        duration: 2,
        location: '体育馆羽毛球馆',
        purpose: '私人活动',
        maxVisitors: 5,
        validDays: 1,
        status: 'Rejected',
        visitors: [
            { id: 'v5', name: '孙悟空', phone: '13600136000', idType: 'other', idNumber: '999999' }
        ]
    },
    {
        id: 'VS20240611001',
        applicationDate: '2024-06-11 09:00',
        visitDate: '2024-06-15',
        startTime: '13:00',
        duration: 3,
        location: '教学楼A栋',
        purpose: '设备维修',
        maxVisitors: 2,
        validDays: 1,
        status: 'Pending',
        visitors: [
            { id: 'v6', name: '周师傅', phone: '13500135000', idType: 'id-card', idNumber: '510101197508081111' }
        ]
    }
];
