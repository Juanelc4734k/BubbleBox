export const verificarRol = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token');
        }

        const response = await fetch('http://localhost:3000/auth/verify-role', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al verificar el rol');
        }

        const data = await response.json();
        return data.role;
    } catch (error) {
        console.error('Error en verificarRol:', error);
        throw error;
    }
};