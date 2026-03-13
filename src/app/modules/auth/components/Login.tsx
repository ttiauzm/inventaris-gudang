import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link, useNavigate} from 'react-router-dom'
import {useFormik} from 'formik'
import {useAuth} from '../core/Auth'
import {UserModel} from '../core/_models'
import API from "../../../../api"

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .min(3, 'Minimum 3 karakter')
    .max(50, 'Maksimum 50 karakter')
    .required('Username atau Email wajib diisi'),
  password: Yup.string()
    .min(3, 'Minimum 3 karakter')
    .max(100, 'Maksimum 100 karakter')
    .required('Password wajib diisi'),
})

const initialValues = {
  email: 'dev@example.com',
  password: '1234',
}

// Dev user dengan type yang benar
const DEV_USER: UserModel = {
  id: 999,
  username: "dev",
  password: undefined,
  email: "dev@example.com",
  first_name: "Dev",
  last_name: "User",
  fullname: "Dev User",
  occupation: "Developer",
  companyName: "Development",
  phone: "0000000000",
  roles: [999], // SuperAdmin role
  role: "SuperAdmin",
  pic: "",
  language: "en",
  timeZone: "Asia/Jakarta",
  website: "https://keenthemes.com",
  emailSettings: {
    emailNotification: true,
    sendCopyToPersonalEmail: false
  },
  auth: {
    token: "dev-token",
  },
  communication: {
    email: true,
    sms: false,
    phone: false
  },
  address: {
    addressLine: "Dev Street",
    city: "Jakarta",
    state: "ID",
    postCode: "12345"
  },
  socialNetworks: {
    linkedIn: "",
    facebook: "",
    twitter: "",
    instagram: ""
  }
}

// Admin user
const ADMIN_USER: UserModel = {
  id: 888,
  username: "admin",
  password: undefined,
  email: "admin@example.com",
  first_name: "Admin",
  last_name: "User",
  fullname: "Admin User",
  occupation: "Administrator",
  companyName: "Delova",
  phone: "0000000000",
  roles: [888],
  role: "Admin",
  pic: "",
  language: "en",
  timeZone: "Asia/Jakarta",
  website: "https://delova.com",
  emailSettings: {
    emailNotification: true,
    sendCopyToPersonalEmail: false
  },
  auth: {
    token: "admin-token",
  },
  communication: {
    email: true,
    sms: false,
    phone: false
  },
  address: {
    addressLine: "Admin Street",
    city: "Jakarta",
    state: "ID",
    postCode: "12345"
  },
  socialNetworks: {
    linkedIn: "",
    facebook: "",
    twitter: "",
    instagram: ""
  }
}

// const onSubmit = async (values) => {
//    try {

//       // 1️⃣ Ambil CSRF cookie dulu
//       await axios.get('/sanctum/csrf-cookie', {
//          withCredentials: true
//       });

//       // 2️⃣ Baru login
//       await axios.post('/api/login', values, {
//          withCredentials: true
//       });

//    } catch (error) {
//       console.log(error);
//    }


export function Login() {
  const [loading, setLoading] = useState(false)
  const {saveAuth, setCurrentUser} = useAuth()
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)

      // BYPASS LOGIN untuk Development - cek berbagai format
      const isDevLogin = 
        (values.email === "dev" || values.email === "dev@example.com") && 
        values.password === "1234"

      const isAdminLogin = 
        (values.email === "admin" || values.email === "admin@example.com") && 
        values.password === "admin"

      if (isDevLogin || isAdminLogin) {
        console.log('=====DEV MODE: Bypassing authentication=====')
        console.log('Email:', values.email)
        console.log('Password:', values.password)
        
        const userToLogin = isDevLogin ? DEV_USER : ADMIN_USER;
        const token = isDevLogin ? "dev-token" : "admin-token";

        try {
          const devAuth = { token: token }
          
          console.log('🔑 Dev/Admin login - Setting auth and user...')
          console.log('  Auth:', devAuth)
          console.log('  User:', userToLogin)
          
          // Save auth first
          saveAuth(devAuth)
          
          // Then set current user (will be saved to localStorage by AuthProvider)
          setCurrentUser(userToLogin)
          
          // Verify localStorage
          setTimeout(() => {
            const savedAuth = localStorage.getItem('kt-auth-react-v')
            const savedUser = localStorage.getItem('current-user')
            console.log('✅ Verification after save:', {
              hasAuth: !!savedAuth,
              hasUser: !!savedUser,
              auth: savedAuth,
              user: savedUser
            })
            
            // Navigate to dashboard
            console.log('🔄 Navigating to dashboard...')
            navigate('/dashboard')
          }, 200)
          
          setLoading(false)
          return
        } catch (error) {
          console.error('❌ Dev/Admin login error:', error)
          setStatus('Login failed: ' + error)
          setLoading(false)
          return
        }
      }

      // Login normal ke Laravel API
      try {
        console.log('🔐 Normal login attempt')
        
        // Ambil CSRF cookie dulu dengan base URL yang sama dengan API
        // const csrfUrl = API.defaults.baseURL?.replace('/api', '/sanctum/csrf-cookie') || '/sanctum/csrf-cookie'
        // await axios.get(csrfUrl, { withCredentials: true })
        
        const response = await API.post("/login", {
          login: values.email, 
          password: values.password,
        })

        console.log('📦 Login response:', response.data)

        // Backend returns: { success: true, data: { access_token: "...", token_type: "Bearer", user: {...} } }
        const responseData = response.data
        const token: string | undefined =
          responseData?.data?.access_token ||   // struktur: { data: { access_token } }
          responseData?.access_token ||          // struktur: { access_token }
          responseData?.token                    // struktur: { token } (fallback)

        if (!token) {
          console.error('❌ Token tidak ditemukan di response:', responseData)
          throw new Error('Token tidak ditemukan dalam response login')
        }

        console.log('✅ Token diterima:', token.substring(0, 20) + '...')
        saveAuth({ token })
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Data user dari login response (fallback minimal)
        // Backend: data.user = { username, email } dan data.role = 'superadmin' (string)
        const loginUserData = responseData?.data?.user ?? {}
        // Role string langsung dari login response (mis: 'superadmin', 'admin')
        const loginRoleFromResponse: string = responseData?.data?.role ?? ''

        // Ekstrak nama role dari berbagai bentuk data
        // Backend Role model menggunakan field 'role_name' (bukan 'nama_role')
        const extractRoleName = (roleData: any): string => {
          if (!roleData) return ''
          if (typeof roleData === 'string') return roleData
          // Role object dari Laravel relationship: { role_id, role_name, ... }
          return roleData.role_name ?? roleData.nama_role ?? ''
        }

        // Helper untuk mapping data user ke UserModel
        const buildUserModel = (userData: any) => {
          // Role name: coba dari userData (profile response eager-loads role),
          // lalu fallback ke loginRoleFromResponse (data.role dari login)
          const roleName =
            extractRoleName(userData.role) ||
            userData.nama_role ||
            loginRoleFromResponse ||
            extractRoleName(loginUserData.role) ||
            loginUserData.nama_role ||
            ''

          const roleId =
            userData.role_id ??
            (typeof loginUserData.role === 'object' ? loginUserData.role?.role_id : undefined) ??
            loginUserData.role_id ??
            ''

          console.log('🎭 Role resolved:', { roleName, roleId, rawRole: userData.role, loginRole: loginUserData.role })

          return {
            id: userData.user_id ?? userData.id ?? loginUserData.user_id ?? loginUserData.id ?? '',
            username: userData.username ?? loginUserData.username ?? '',
            email: userData.email ?? loginUserData.email ?? values.email,
            first_name: userData.first_name ?? userData.username ?? loginUserData.username ?? '',
            last_name: userData.last_name ?? '',
            fullname: userData.fullname ?? userData.name ?? userData.username ?? loginUserData.username ?? '',
            password: undefined,
            role: roleName,      // Selalu string (e.g. 'superadmin', 'admin')
            nama_role: roleName, // Sama, untuk backward-compat dengan permissionHelper
            role_id: roleId,
            pic: userData.pic ?? userData.avatar ?? '',
            language: userData.language ?? 'en',
            timeZone: userData.timeZone ?? userData.timezone ?? 'Asia/Jakarta',
            phone: userData.phone ?? '',
            occupation: userData.occupation ?? '',
            companyName: userData.companyName ?? userData.company_name ?? '',
            website: userData.website ?? '',
            roles: userData.roles ?? [],
            emailSettings: userData.emailSettings ?? { emailNotification: false, sendCopyToPersonalEmail: false },
            communication: userData.communication ?? { email: false, sms: false, phone: false },
            address: userData.address ?? { addressLine: '', city: '', state: '', postCode: '' },
            socialNetworks: userData.socialNetworks ?? { linkedIn: '', facebook: '', twitter: '', instagram: '' },
          }
        }

        // Ambil data lengkap user dari /profile
        // Jika gagal (misal DB issue), tetap pakai data dari login response agar user bisa masuk
        let mappedUser
        try {
          const profileRes = await API.get("/profile")
          const userData = profileRes.data
          console.log('👤 Profile response:', userData)
          mappedUser = buildUserModel(userData)
        } catch (profileError: any) {
          console.warn('⚠️ /profile gagal, menggunakan data dari login response:', profileError?.response?.status)
          // Fallback: pakai data minimal dari login response
          mappedUser = buildUserModel(loginUserData)
        }

        setCurrentUser(mappedUser)
        // Simpan waktu login terakhir ke localStorage (digunakan oleh halaman manajemen akun)
        if (mappedUser.id) {
          localStorage.setItem(`sim_last_login_${mappedUser.id}`, new Date().toISOString())
        }
        setLoading(false)
        navigate('/dashboard')
      } catch (error: any) {
        console.error('Login error:', error)
        saveAuth(undefined)
        setStatus(
          error?.response?.data?.message || error?.message || "Password atau email salah"
        )
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  return (
    <form
      className='form w-100'
      onSubmit={formik.handleSubmit}
      noValidate
      id='kt_login_signin_form'
    >
      <div className='text-center mb-11'>
        <h1 
          className='fw-bolder mb-3' 
          style={{ color: '#897870'}}
        >
          Sign In
        </h1>
        <div className='text-gray-500 fw-semibold fs-6'>
          SIM Fashion Industry
        </div>
      </div>

      <div className='separator separator-content my-14'></div>

      {formik.status && (
        <div
          className='mb-8 d-flex align-items-start gap-4 p-5 rounded-3'
          style={{
            backgroundColor: '#fff5f5',
            border: '1.5px solid #f87171',
            borderLeft: '5px solid #ef4444',
            boxShadow: '0 2px 12px rgba(239,68,68,0.10)',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <span style={{fontSize: '1.5rem', lineHeight: 1}}>⚠️</span>
          <div>
            <div className='fw-bold text-danger fs-6 mb-1'>Login Gagal</div>
            <div className='text-gray-700 fs-7'>{formik.status}</div>
          </div>
        </div>
      )}

      <div className='mb-10 bg-light-info p-8 rounded'>
        <div className='text-info'>
          <strong>🔓 DEV MODE:</strong>
          <br />
          Super Admin: <strong>dev@example.com</strong> / <strong>1234</strong>
          <br />
          Admin: <strong>admin@example.com</strong> / <strong>admin</strong>
        </div>
      </div>

      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-gray-900'>Username / Email</label>
        <input
          placeholder='Enter Username or Email'
          {...formik.getFieldProps('email')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.email && formik.errors.email},
            {'is-valid': formik.touched.email && !formik.errors.email}
          )}
          type='text'
          name='email'
          autoComplete='off'
        />
        {formik.touched.email && formik.errors.email && (
          <div className='fv-plugins-message-container'>
            <span role='alert'>{formik.errors.email}</span>
          </div>
        )}
      </div>

      <div className='fv-row mb-3'>
        <label className='form-label fw-bolder text-gray-900 fs-6 mb-0'>Password</label>
        <input
          type='password'
          placeholder='1234'
          autoComplete='off'
          {...formik.getFieldProps('password')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.password && formik.errors.password},
            {'is-valid': formik.touched.password && !formik.errors.password}
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>

      <div className='d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8'>
        <div />
        <Link to='/auth/forgot-password' className='link-primary'>
          Lupa Password?
        </Link>
      </div>

      <div className='d-grid mb-10'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-primary'
          style={{ backgroundColor: '#F4EFE6', color: '#252F4A'}}
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {!loading && <span className='indicator-label'>Continue</span>}
          {loading && (
            <span className='indicator-progress' style={{display: 'block'}}>
              Please wait...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>

      <div className='text-gray-500 text-center fw-semibold fs-6'>
        Not a Member yet?{' '}
        <Link to='/auth/registration' className='link-primary'>
          Sign up
        </Link>
      </div>
    </form>
  )
}