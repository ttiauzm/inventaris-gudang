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
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
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
        const response = await API.post("/login", {
          email: values.email,
          password: values.password,
        })

        const token = response.data.token
        saveAuth({ token })
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`

        const profile = await API.get("/profile")
        setCurrentUser(profile.data)

        setLoading(false)
        navigate('/dashboard')
      } catch (error: any) {
        console.error('Login error:', error)
        saveAuth(undefined)
        setStatus(
          error?.response?.data?.message || "The login details are incorrect"
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

      {formik.status ? (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      ) : (
        <div className='mb-10 bg-light-info p-8 rounded'>
          <div className='text-info'>
            <strong>🔓 DEV MODE:</strong>
            <br />
            Super Admin: <strong>dev@example.com</strong> / <strong>1234</strong>
            <br />
            Admin: <strong>admin@example.com</strong> / <strong>admin</strong>
          </div>
        </div>
      )}

      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-gray-900'>Username</label>
        <input
          placeholder='dev@example.com'
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
          Forgot Password ?
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