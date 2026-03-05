'use client'

import { useState, useEffect } from 'react'
import { adminApi, type Partner } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Loader2, User, Mail, Phone, Building } from 'lucide-react'

export default function PartnersPendientesPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    loadPartners()
  }, [])

  async function loadPartners() {
    try {
      setLoading(true)
      const data = await adminApi.partners.listPending()
      setPartners(data)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al cargar partners', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: number) {
    try {
      setProcessingId(id)
      await adminApi.partners.approve(id)
      addToast('Partner aprobado exitosamente', 'success')
      setPartners(partners.filter(p => p.id !== id))
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al aprobar partner', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(id: number) {
    try {
      setProcessingId(id)
      await adminApi.partners.reject(id)
      addToast('Partner rechazado', 'success')
      setPartners(partners.filter(p => p.id !== id))
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al rechazar partner', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Partners Pendientes</h1>
        <p className="text-muted-foreground">
          Revisa y aprueba los nuevos registros de partners
        </p>
      </div>

      {partners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No hay partners pendientes</p>
            <p className="text-sm text-muted-foreground">
              Los nuevos partners aparecerán aquí para su aprobación
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <Card key={partner.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  {partner.businessName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {partner.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{partner.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Estado:</span>
                  <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                    Pendiente
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApprove(partner.id)}
                    disabled={processingId === partner.id}
                  >
                    {processingId === partner.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Aprobar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleReject(partner.id)}
                    disabled={processingId === partner.id}
                  >
                    {processingId === partner.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Rechazar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
