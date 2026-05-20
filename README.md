# Nodo Documentos — Firma Electrónica

Este módulo permite crear, compartir y firmar documentos electrónicamente sin necesidad de imprimirlos, en conformidad con la Ley 527 de 1999 de Colombia.

---

## 🛠️ Configuración de la Base de Datos (Supabase)

Para almacenar el estado de los documentos y las firmas del cliente, sigue estos pasos:

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al **SQL Editor** en tu panel de Supabase y ejecuta la siguiente consulta para crear la tabla de documentos y habilitar los permisos públicos de lectura y escritura:

```sql
-- 1. Crear tabla de documentos
CREATE TABLE public.nodo_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    doc_type TEXT NOT NULL,
    data JSONB NOT NULL,
    status TEXT DEFAULT 'pending'::text NOT NULL,
    signature_client TEXT, -- Firma en formato Base64 PNG
    client_fullname TEXT,
    client_cc TEXT,
    client_email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Habilitar seguridad RLS (opcional, o crear políticas si se requiere)
-- Por simplicidad en desarrollo se pueden habilitar políticas de lectura/escritura pública:
ALTER TABLE public.nodo_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserción pública" 
ON public.nodo_documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir lectura pública" 
ON public.nodo_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir actualización pública" 
ON public.nodo_documents 
FOR UPDATE 
USING (true);
```

---

## ⚙️ Variables de Entorno

En la carpeta raíz de `nodo-documentos`, edita el archivo `.env.local` y añade tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica-de-supabase
```

*Nota: Si no se configuran estas variables, la aplicación entrará automáticamente en **Modo de Simulación (LocalStorage)**. Esto te permite probar todo el flujo de firma localmente en tu navegador sin necesidad de una base de datos conectada.*

---

## ✍️ Cómo Funciona el Flujo

1. **Creación:** Llena los campos del documento en la barra izquierda del panel de administrador.
2. **Generación de Enlace:** Haz clic en **"✍️ Enviar para Firma"**. Se guardarán los datos y se generará un enlace único con un identificador (UUID).
3. **Compartir:** Copia el enlace o envíalo directamente por WhatsApp usando el botón integrado.
4. **Firma del Cliente:** Cuando el cliente abra el enlace:
   * El panel lateral de edición se ocultará y el documento se mostrará en modo lectura.
   * Al final del documento se habilitará un formulario con datos personales y un lienzo interactivo de firma (Signature Pad).
   * Al confirmar la firma, se capturan metadatos de auditoría (IP del cliente, Fecha y Hora del servidor, Navegador web) y se guarda la firma de forma segura.
5. **Auditoría e Impresión:** Una vez firmado, el documento mostrará la firma digital estampada y una **Hoja de Pista de Auditoría** para validez legal. Al hacer clic en "Descargar PDF Firmado", se activará la vista de impresión optimizada para guardar el archivo como PDF.

