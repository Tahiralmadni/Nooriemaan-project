const Teachers = () => {
    // Staff Data - Basic
    const staffData = [
        { id: 1, name: 'Muhammad Akram Attari', email: 'ishaqakram67@gmail.com' },
        { id: 2, name: 'Qari Syed Umair Attari', email: '-' },
        { id: 3, name: 'Muhammad Muneeb Sabir', email: 'muneebattari527@gmail.com' },
        { id: 4, name: 'Mudassir Raza', email: 'mudassirrazachishti@gmail.com' },
        { id: 5, name: 'Ubaid Raza', email: 'ubaidattari0326@gmail.com' },
        { id: 6, name: 'Muhammad Rizwan Hussain', email: '-' },
        { id: 7, name: 'Muhammad Kashif Attari', email: '-' },
        { id: 8, name: 'Muhammad Hashim', email: '-' },
        { id: 9, name: 'Ahmed Shah', email: '-' },
        { id: 10, name: 'Jawad', email: 'jawadsoomrowork@gmail.com' },
        { id: 11, name: 'Hanzalah Tahir', email: 'hanzalahtahir93@gmail.com' },
    ];

    return (
        <div>
            <h2>Teachers</h2>

            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>#</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {staffData.map((staff) => (
                        <tr key={staff.id}>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{staff.id}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{staff.name}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{staff.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Teachers;
