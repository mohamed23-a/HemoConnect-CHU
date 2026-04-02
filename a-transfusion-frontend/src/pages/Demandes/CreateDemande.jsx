import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import demandeService from '../../services/demandeService'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const PRODUCT_TYPES = ['WB', 'RBC', 'WBC', 'Plasma']

/* ── Field wrapper — MUST be outside CreateDemande to avoid remount on each keystroke ── */
const Field = ({ label, hint, error, required, children }) => (
  <div>
    <label className="th-label">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-xs" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

const CreateDemande = () => {
  const navigate    = useNavigate()
  const { id }      = useParams()
  const { t }       = useTranslation()
  const [loading, setLoading] = useState(false)
  const isEditMode  = !!id

  const [form, setForm] = useState({
    patient_name: '', patient_age: '', blood_type: '', product_type: '',
    quantity: 1, reason: '', urgency: 'normal', notes: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEditMode) {
      const fetchDemande = async () => {
        try {
          const res = await demandeService.getDemande(id)
          setForm({
            patient_name: res.data.patient_name || '',
            patient_age: res.data.patient_age || '',
            blood_type: res.data.blood_type || '',
            product_type: res.data.product_type || '',
            quantity: res.data.quantity || 1,
            reason: res.data.reason || '',
            urgency: res.data.urgency || 'normal',
            notes: res.data.notes || '',
          })
        } catch (e) {
          toast.error(t('errors.load_failed'))
          navigate('/demandes')
        }
      }
      fetchDemande()
    }
  }, [id, isEditMode, navigate, t])

  const change = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.patient_name.trim())                             errs.patient_name = t('create.err_name_required')
    if (!form.patient_age)                                     errs.patient_age  = t('create.err_age_required')
    if (form.patient_age < 0 || form.patient_age > 120)       errs.patient_age  = t('create.err_age_range')
    if (!form.blood_type)                                      errs.blood_type   = t('create.err_blood_required')
    if (!form.product_type)                                    errs.product_type = t('create.err_product_required')
    if (!form.quantity || form.quantity < 1)                   errs.quantity     = t('create.err_qty_min')
    if (form.quantity > 50)                                    errs.quantity     = t('create.err_qty_max')
    if (!form.reason.trim())                                   errs.reason       = t('create.err_reason_required')
    if (form.reason.trim().length < 10)                        errs.reason       = t('create.err_reason_min')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (isEditMode) {
        await demandeService.updateDemande(id, form)
        toast.success(t('demandes.updated_ok') || 'Updated successfully')
      } else {
        await demandeService.createDemande(form)
        toast.success(t('create.success'))
      }
      navigate('/demandes')
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.generic'))
      if (error.response?.data?.errors) setErrors(error.response.data.errors)
    } finally {
      setLoading(false)
    }
  }




  const inputCls = (field) =>
    `th-input ${errors[field] ? 'border-red-500 focus:border-red-500 focus:shadow-red-100' : ''}`

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="page-title">{isEditMode ? t('create.edit_title') || 'Edit Request' : t('create.title')}</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('create.subtitle')}</p>
      </motion.div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Patient Name */}
          <Field label={t('create.patient_name')} error={errors.patient_name} required>
            <input className={inputCls('patient_name')} type="text" name="patient_name"
              value={form.patient_name} onChange={change} placeholder={t('create.patient_name_ph')} />
          </Field>

          {/* Age + Blood type + Product type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label={t('create.patient_age')} error={errors.patient_age} required>
              <input className={inputCls('patient_age')} type="number" name="patient_age"
                value={form.patient_age} onChange={change} placeholder={t('create.patient_age_ph')} min="0" max="120" />
            </Field>

            <Field label={t('create.blood_type')} error={errors.blood_type} required>
              <select className={inputCls('blood_type')} name="blood_type" value={form.blood_type} onChange={change}>
                <option value="">{t('create.blood_type_ph')}</option>
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </Field>

            <Field label={t('create.product_type') || 'Product Type'} error={errors.product_type} required>
              <select className={inputCls('product_type')} name="product_type" value={form.product_type} onChange={change}>
                <option value="">{t('create.product_type_ph') || 'Select Product'}</option>
                {PRODUCT_TYPES.map(pt => <option key={pt} value={pt}>{t(`product.${pt}`) || pt}</option>)}
              </select>
            </Field>
          </div>

          {/* Quantity + Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('create.quantity')} hint={t('create.quantity_hint')} error={errors.quantity} required>
              <input className={inputCls('quantity')} type="number" name="quantity"
                value={form.quantity} onChange={change} min="1" max="50" />
            </Field>
            <Field label={t('create.urgency')} required>
              <select className="th-input" name="urgency" value={form.urgency} onChange={change}>
                <option value="normal">{t('urgency.normal')}</option>
                <option value="urgent">{t('urgency.urgent')}</option>
                <option value="emergency">{t('urgency.emergency')}</option>
              </select>
            </Field>
          </div>

          {/* Reason */}
          <Field label={t('create.reason')} error={errors.reason} required>
            <textarea className={inputCls('reason')} name="reason" rows={3}
              value={form.reason} onChange={change} placeholder={t('create.reason_ph')} />
          </Field>

          {/* Notes */}
          <Field label={t('create.notes')}>
            <textarea className="th-input" name="notes" rows={2}
              value={form.notes} onChange={change} placeholder={t('create.notes_ph')} />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button type="button" variant="outline" onClick={() => navigate('/demandes')}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {isEditMode ? t('create.save_changes') || 'Save Changes' : t('create.submit')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateDemande