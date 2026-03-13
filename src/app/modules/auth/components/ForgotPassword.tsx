import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useFormik} from 'formik'
import {requestPassword} from '../core/_requests'

const initialValues = {
  email: '',
}

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Format email tidak valid')
    .min(3, 'Minimal 3 karakter')
    .max(50, 'Maksimal 50 karakter')
    .required('Email wajib diisi'),
})

export function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined)
  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      setHasErrors(undefined)
      try {
        await requestPassword(values.email)
        setHasErrors(false)
      } catch (error: any) {
        const msg = error?.response?.data?.message || 'Email tidak ditemukan di sistem.'
        setHasErrors(true)
        setStatus(msg)
      } finally {
        setLoading(false)
        setSubmitting(false)
      }
    },
  })

  return (
    <form
      className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
      noValidate
      id='kt_login_password_reset_form'
      onSubmit={formik.handleSubmit}
    >
      <div className='text-center mb-10'>
        <h1 className='text-gray-900 fw-bolder mb-3'>Lupa Password?</h1>
        <div className='text-gray-500 fw-semibold fs-6'>
          Masukkan email Anda dan kami akan mengirim link untuk reset password.
        </div>
      </div>

      {hasErrors === true && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>
            {formik.status || 'Terjadi kesalahan. Silakan coba lagi.'}
          </div>
        </div>
      )}

      {hasErrors === false && (
        <div className='mb-10 bg-light-info p-8 rounded'>
          <div className='text-info fw-semibold'>
            Link reset password telah dikirim ke email Anda. Silakan cek inbox Anda.
          </div>
        </div>
      )}

      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>Email</label>
        <input
          type='email'
          placeholder='email@example.com'
          autoComplete='off'
          {...formik.getFieldProps('email')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.email && formik.errors.email},
            {'is-valid': formik.touched.email && !formik.errors.email}
          )}
        />
        {formik.touched.email && formik.errors.email && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.email}</span>
            </div>
          </div>
        )}
      </div>

      <div className='d-flex flex-wrap justify-content-center pb-lg-0 gap-3'>
        <button
          type='submit'
          id='kt_password_reset_submit'
          className='btn btn-product'
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {loading ? (
            <span className='indicator-progress'>
              Mohon tunggu...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          ) : (
            <span className='indicator-label'>Kirim Link Reset</span>
          )}
        </button>
        <Link to='/auth/login'>
          <button type='button' className='btn btn-light'>
            Kembali ke Login
          </button>
        </Link>
      </div>
    </form>
  )
}
