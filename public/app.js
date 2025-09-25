// Token ve kullanıcı bilgilerini yönetme fonksiyonları
function getToken() {
    return localStorage.getItem('token') || '';
}

function getTenant() {
    return localStorage.getItem('tenant') || '1';
}

function getRole() {
    return localStorage.getItem('rol') || 'okuyucu';
}

function getUserInfo() {
    return {
        token: getToken(),
        tenant: getTenant(),
        role: getRole(),
        email: localStorage.getItem('email') || '',
        name: localStorage.getItem('ad') || ''
    };
}

// API istekleri için helper fonksiyon
async function apiFetch(url, options = {}) {
    const token = getToken();
    const tenant = getTenant();

    options.headers = Object.assign({
        'Authorization': `Bearer ${token}`,
        'X-Tenant': tenant,
        'Content-Type': 'application/json'
    }, options.headers || {});

    try {
        const response = await fetch(url, options);

        // Yetkisizlik durumunda login sayfasına yönlendir
        if (response.status === 401 || response.status === 403) {
            alert('Oturum süresi dolmuş veya yetkisiz erişim. Giriş sayfasına yönlendiriliyorsunuz.');
            localStorage.clear();
            window.location.href = '/login.html';
            throw new Error('Yetkisiz erişim');
        }

        return response;
    } catch (error) {
        console.error('API isteği hatası:', error);
        throw error;
    }
}

// Admin kontrolü için helper fonksiyon
function showIfAdmin(element) {
    if (getRole() !== 'admin') {
        element.style.display = 'none';
    }
}

// Logout fonksiyonu
function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

// Sayfa yüklenmesi kontrolü
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Hata mesajı gösterme
function showError(message, elementId = 'errorMessage') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.className = 'alert alert-danger';
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

// Başarı mesajı gösterme
function showSuccess(message, elementId = 'successMessage') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.className = 'alert alert-success';
        successElement.style.display = 'block';
    } else {
        alert(message);
    }
}

// Mesajları temizle
function clearMessages() {
    const errorElement = document.getElementById('errorMessage');
    const successElement = document.getElementById('successMessage');

    if (errorElement) errorElement.style.display = 'none';
    if (successElement) successElement.style.display = 'none';
}