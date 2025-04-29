<template>
    <div class="login-container">
        <div class="login-box">
            <div class="login-logo">
                <img src="../../assets/img/logo.svg" alt="logo" />
                <h2>后台管理系统</h2>
            </div>

            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
                <div class="title-container">
                    <h3 class="title">系统登录</h3>
                </div>

                <el-form-item prop="username">
                    <el-input 
                        v-model="loginForm.username" 
                        placeholder="用户名" 
                        prefix-icon="User" 
                        autocomplete="off" 
                        @keyup.enter="handleLogin(loginFormRef)"
                    />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input 
                        v-model="loginForm.password" 
                        placeholder="密码" 
                        prefix-icon="Lock" 
                        show-password 
                        @keyup.enter="handleLogin(loginFormRef)"
                    />
                </el-form-item>

                <el-form-item>
                    <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
                </el-form-item>

                <el-button 
                    :loading="loading" 
                    type="primary" 
                    class="login-button" 
                    @click="handleLogin(loginFormRef)"
                >
                    {{ loading ? '登录中...' : '登录' }}
                </el-button>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { md5Encrypt } from '../../utils/crypto';
import { apiLogin } from '../../api/auth';
import { User, Lock } from '@element-plus/icons-vue';

// 表单引用
const loginFormRef = ref<FormInstance>();
// 记住密码
const rememberMe = ref(false); 
// 加载状态
const loading = ref(false);
// 路由
const router = useRouter();

// 登录表单数据
const loginForm = reactive({
    username: '',
    password: ''
});

// 表单验证规则
const loginRules: FormRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
};

// 处理登录
const handleLogin = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;

    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                // 对密码进行MD5加密
                const encryptedPassword = md5Encrypt(loginForm.password);
                
                // 调用登录API
                const res = await apiLogin({
                    username: loginForm.username,
                    password: encryptedPassword
                });
                
                // 判断登录是否成功
                if (res.code === 200) {
                    console.log('登录成功，获取到的数据:', res.data);
                    
                    // 先保存token到localStorage（确保授权请求头在后续请求中可用）
                    const { token, userInfo } = res.data;
                    localStorage.setItem('vuems_token', token);
                    localStorage.setItem('vuems_name', userInfo.username);
                    
                    // 存储用户信息
                    localStorage.setItem('vuems_user', JSON.stringify(userInfo));
                    
                    // 如果选择记住密码，保存用户名
                    if (rememberMe.value) {
                        localStorage.setItem('login_remember', JSON.stringify({
                            username: loginForm.username,
                            remember: true
                        }));
                    } else {
                        localStorage.removeItem('login_remember');
                    }
                    
                    ElMessage.success('登录成功');
                    
                    // 登录成功后跳转到首页
                    setTimeout(() => {
                        router.push('/');
                    }, 500);
                } else {
                    ElMessage.error(res.message || '登录失败，请检查用户名和密码');
                }
            } catch (error: any) {
                console.error('登录出错:', error);
                ElMessage.error(error.message || '登录失败，请稍后重试');
            } finally {
                loading.value = false;
            }
        }
    });
};

// 在组件挂载时，从本地存储中恢复记住的用户名
onMounted(() => {
    const rememberData = localStorage.getItem('login_remember');
    if (rememberData) {
        const data = JSON.parse(rememberData);
        loginForm.username = data.username;
        rememberMe.value = data.remember;
    }
});
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    background: url('../../assets/img/login-bg.jpg') no-repeat center center;
    background-size: cover;
}

.login-box {
    width: 420px;
    padding: 30px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
}

.login-logo img {
    width: 60px;
    height: 60px;
    margin-bottom: 10px;
}

.login-logo h2 {
    margin: 0;
    font-size: 24px;
    color: #303133;
}

.title-container {
    margin-bottom: 30px;
    text-align: center;
}

.title {
    margin: 0;
    font-size: 20px;
    color: #303133;
    font-weight: bold;
}

.login-form {
    width: 100%;
}

.login-button {
    width: 100%;
    margin-top: 10px;
    border-radius: 4px;
    font-size: 16px;
    height: 44px;
}
</style> 