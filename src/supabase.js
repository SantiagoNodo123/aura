// Supabase client helper using vanilla fetch to avoid npm installation issues
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const getHeaders = () => ({
  "apikey": supabaseAnonKey,
  "Authorization": `Bearer ${supabaseAnonKey}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
});

export const db = {
  // Create a new document in the database
  async createDocument(docType, data) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials not configured. Falling back to local storage.");
      return mockDb.createDocument(docType, data);
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/nodo_documents`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          doc_type: docType,
          data: data,
          status: "pending"
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result[0];
    } catch (error) {
      console.error("Error creating document in Supabase:", error);
      throw error;
    }
  },

  // Get a document by ID
  async getDocument(id) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials not configured. Falling back to local storage.");
      return mockDb.getDocument(id);
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/nodo_documents?id=eq.${id}`, {
        method: "GET",
        headers: {
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching document from Supabase:", error);
      throw error;
    }
  },

  // Sign a document (update status, signature image, and metadata)
  async signDocument(id, signatureData) {
    const { signatureClient, fullname, cc, email, ip, userAgent } = signatureData;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials not configured. Falling back to local storage.");
      return mockDb.signDocument(id, signatureData);
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/nodo_documents?id=eq.${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          status: "signed",
          signature_client: signatureClient,
          client_fullname: fullname,
          client_cc: cc,
          client_email: email,
          ip_address: ip,
          user_agent: userAgent,
          signed_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result[0];
    } catch (error) {
      console.error("Error signing document in Supabase:", error);
      throw error;
    }
  }
};

// Fallback Mock Database using LocalStorage for development or if keys are missing
const mockDb = {
  createDocument(docType, data) {
    const id = crypto.randomUUID();
    const doc = {
      id,
      doc_type: docType,
      data,
      status: "pending",
      created_at: new Date().toISOString()
    };
    localStorage.setItem(`doc_${id}`, JSON.stringify(doc));
    return doc;
  },

  getDocument(id) {
    const docStr = localStorage.getItem(`doc_${id}`);
    return docStr ? JSON.parse(docStr) : null;
  },

  signDocument(id, signatureData) {
    const doc = this.getDocument(id);
    if (!doc) throw new Error("Document not found");

    doc.status = "signed";
    doc.signature_client = signatureData.signatureClient;
    doc.client_fullname = signatureData.fullname;
    doc.client_cc = signatureData.cc;
    doc.client_email = signatureData.email;
    doc.ip_address = signatureData.ip;
    doc.user_agent = signatureData.userAgent;
    doc.signed_at = new Date().toISOString();

    localStorage.setItem(`doc_${id}`, JSON.stringify(doc));
    return doc;
  }
};
