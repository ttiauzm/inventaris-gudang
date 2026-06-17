import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link, useNavigate, useLocation} from 'react-router-dom'
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
  email: '',
  password: '',
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

export function Login() {
  const [loading, setLoading] = useState(false)
  const {saveAuth, setCurrentUser} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Ambil rute asal dari localStorage (jika tersimpan dari akses link tanpa login)
  const pendingRedirect = localStorage.getItem('sim_pending_redirect');
  const from = pendingRedirect && pendingRedirect !== '/' && !pendingRedirect.startsWith('/auth') 
    ? pendingRedirect 
    : '/dashboard';
  
  console.log('📍 Login computed from:', from);

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
        
        const userToLogin = isDevLogin ? DEV_USER : ADMIN_USER;
        const token = isDevLogin ? "dev-token" : "admin-token";

        try {
          const devAuth = { token: token }
          
          saveAuth(devAuth)
          setCurrentUser(userToLogin)
          
          setTimeout(() => {
            if (pendingRedirect) localStorage.removeItem('sim_pending_redirect');
            navigate(from, { replace: true })
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
        
        const response = await API.post("/login", {
          login: values.email, 
          password: values.password,
        })

        const responseData = response.data
        const token: string | undefined =
          responseData?.data?.access_token ||   
          responseData?.access_token ||          
          responseData?.token                    

        if (!token) {
          throw new Error('Token tidak ditemukan dalam response login')
        }

        saveAuth({ token })
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`

        const loginUserData = responseData?.data?.user ?? {}
        const loginRoleFromResponse: string = responseData?.data?.role ?? ''

        const extractRoleName = (roleData: any): string => {
          if (!roleData) return ''
          if (typeof roleData === 'string') return roleData
          return roleData.role_name ?? roleData.nama_role ?? ''
        }

        const buildUserModel = (userData: any) => {
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

          return {
            id: userData.user_id ?? userData.id ?? loginUserData.user_id ?? loginUserData.id ?? '',
            username: userData.username ?? loginUserData.username ?? '',
            email: userData.email ?? loginUserData.email ?? values.email,
            first_name: userData.first_name ?? userData.username ?? loginUserData.username ?? '',
            last_name: userData.last_name ?? '',
            fullname: userData.fullname ?? userData.name ?? userData.username ?? loginUserData.username ?? '',
            password: undefined,
            role: roleName,      
            nama_role: roleName, 
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

        let mappedUser
        try {
          const profileRes = await API.get("/profile")
          mappedUser = buildUserModel(profileRes.data)
        } catch (profileError: any) {
          mappedUser = buildUserModel(loginUserData)
        }

        setCurrentUser(mappedUser)
        if (mappedUser.id) {
          localStorage.setItem(`sim_last_login_${mappedUser.id}`, new Date().toISOString())
        }
        
        if (pendingRedirect) localStorage.removeItem('sim_pending_redirect');

        setLoading(false)
        navigate(from, { replace: true })
      } catch (error: any) {
        console.error('Login error:', error)
        saveAuth(undefined)
        
        // Memastikan pesan error yang keluar persis seperti permintaan dan tidak memicu render object
        setStatus("Email/username atau password salah")
        
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  return (
    <form
      className='form w-100'
      // Menambahkan e.preventDefault() secara eksplisit agar page tidak auto-refresh jika API gagal
      onSubmit={(e) => {
        e.preventDefault();
        formik.handleSubmit(e);
      }}
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
        {/* Menggunakan elemen anchor dengan onClick alert untuk mengarahkan pelaporan ke Superadmin */}
        <a 
          href='#'
          onClick={(e) => {
            e.preventDefault();
            alert('Silahkan lapor kepada Superadmin');
          }}
          className='link-primary'
          style={{ cursor: 'pointer' }}
        >
          Lupa Password?
        </a>
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
    </form>
  )
}