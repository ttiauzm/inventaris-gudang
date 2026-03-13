import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link, useSearchParams, useNavigate} from 'react-router-dom'
import {useFormik} from 'formik'
import API from '../../../../api'

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Minimal 6 karakter')
    .required('Password baru wajib diisi'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
})

export function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const formik = useFormik({
    initialValues: {password: '', password_confirmation: ''},
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true)
      setErrorMsg(null)
      try {
        await API.post('/password/reset', {
          email,
          token,
          password: values.password,
          password_confirmation: values.password_confirmation,
        })
        setSuccess(true)
        setTimeout(() => navigate('/auth/login'), 3000)
      } catch (error: any) {
        setErrorMsg(
          error?.response?.data?.message || 'Token tidak valid atau sudah kadaluarsa.'
        )
      } finally {
        setLoading(false)
      }
    },
  })

  if (!token || !email) {
    return (
      <div className='text-center'>
        <h1 className='text-gray-900 fw-bolder mb-3'>Link Tidak Valid</h1>
        <p className='text-gray-500'>Link reset password ini tidak valid atau sudah kadaluarsa.</p>
        <Link to='/auth/forgot-password' className='btn btn-product mt-4'>
          Minta Link Baru
        </Link>
      </div>
    )
  }

  return (
    <form
      className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
      noValidate
      onSubmit={formik.handleSubmit}
    >
      <div className='text-center mb-10'>
        <h1 className='text-gray-900 fw-bolder mb-3'>Buat Password Baru</h1>
        <div className='text-gray-500 fw-semibold fs-6'>
          Masukkan password baru untuk akun Anda.
        </div>
      </div>

      {errorMsg && (
        <div className='mb-6 alert alert-danger'>
          <div className='alert-text'>{errorMsg}</div>
        </div>
      )}

      {success && (
        <div className='mb-6 bg-light-success p-8 rounded'>
          <div className='text-success fw-semibold'>
            Password berhasil diubah! Mengalihkan ke halaman login...
          </div>
        </div>
      )}

      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>Password Baru</label>
        <input
          type='password'
          placeholder='Masukkan password baru'
          autoComplete='new-password'
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

      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>Konfirmasi Password</label>
        <input
          type='password'
          placeholder='Masukkan ulang password baru'
          autoComplete='new-password'
          {...formik.getFieldProps('password_confirmation')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid':
                formik.touched.password_confirmation && formik.errors.password_confirmation,
            },
            {
              'is-valid':
                formik.touched.password_confirmation && !formik.errors.password_confirmation,
            }
          )}
        />
        {formik.touched.password_confirmation && formik.errors.password_confirmation && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.password_confirmation}</span>
            </div>
          </div>
        )}
      </div>

      <div className='d-flex flex-wrap justify-content-center pb-lg-0 gap-3'>
        <button
          type='submit'
          className='btn btn-product'
          disabled={loading || success || !formik.isValid}
        >
          {loading ? (
            <span className='indicator-progress'>
              Menyimpan...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          ) : (
            <span className='indicator-label'>Simpan Password Baru</span>
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
