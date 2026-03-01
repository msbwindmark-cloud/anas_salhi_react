import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  ShieldCheck,
  Mail,
  Edit2,
  Save,
  X,
  MapPin,
} from "lucide-react";
import api from "../api/axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx"; // Importar librería para Excel
import "../assets/Dashboard.css";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// --- 1. DISEÑO DEL PDF (ESTILOS TIPO TABLA) ---
// --- 1. DISEÑO DEL PDF CORREGIDO ---
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    textAlign: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingBottom: 5,
  },
  title: { fontSize: 18, fontWeight: "bold", textTransform: "uppercase" },
  driverBox: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#000",
    marginBottom: 10,
  },
  driverName: {
    width: "30%",
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  paxTotal: {
    width: "20%",
    padding: 10,
    backgroundColor: "#fefce8",
    textAlign: "center",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    minHeight: 30, // Asegura que la fila crezca si hay mucho texto
  },
  tableColHeader: {
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#e5e7eb",
    padding: 5,
    fontWeight: "bold",
    fontSize: 9,
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 5,
    flexDirection: "column", // Para que el nombre, tel y email vayan uno abajo de otro
  },
  cellTime: { backgroundColor: "#fefce8", fontWeight: "bold" },
  clientName: { fontSize: 9, fontWeight: "bold" },
  clientContact: { fontSize: 8, color: "#1d4ed8" }, // Azul para el teléfono
  clientEmail: { fontSize: 7, color: "#6b7280", fontStyle: "italic" }, // Gris para el email
  cellDetail: { fontSize: 7, color: "#dc2626", marginTop: 2 },
});

// --- 2. COMPONENTE DEL DOCUMENTO PDF ACTUALIZADO ---
const DriverPDF = ({ driverName, data, date }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Planning du {date}</Text>
      </View>

      <View style={styles.driverBox}>
        <Text style={styles.driverName}>{driverName}</Text>
        <View
          style={{
            width: "50%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 8 }}>
            PLANNING DES PRESTATIONS ET RAMASSAGE
          </Text>
        </View>
        <View style={styles.paxTotal}>
          <Text style={{ fontSize: 8 }}>TOTAL PAX</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {data.totalPax}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        {/* CABECERA CORREGIDA CON "LANGUE" */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableColHeader, { width: "7%" }]}>Heure</Text>
          <Text style={[styles.tableColHeader, { width: "8%" }]}>Agence</Text>
          <Text style={[styles.tableColHeader, { width: "15%" }]}>
            Excursion
          </Text>
          <Text style={[styles.tableColHeader, { width: "4%" }]}>Pax</Text>
          <Text style={[styles.tableColHeader, { width: "20%" }]}>
            Client / Contact
          </Text>
          <Text style={[styles.tableColHeader, { width: "10%" }]}>Guide</Text>
          <Text style={[styles.tableColHeader, { width: "8%" }]}>
            Langue
          </Text>{" "}
          {/* <-- Nueva Columna */}
          <Text
            style={[
              styles.tableColHeader,
              { width: "28%", borderRightWidth: 0 },
            ]}
          >
            Adresse / Pickup
          </Text>
        </View>

        {/* FILAS DE DATOS CORREGIDAS */}
        {data.services.map((b, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.tableCol, { width: "7%" }, styles.cellTime]}>
              {b.time.substring(0, 5)}
            </Text>
            <Text style={[styles.tableCol, { width: "8%" }]}>
              {b.agency_name}
            </Text>
            <Text
              style={[styles.tableCol, { width: "15%", fontWeight: "bold" }]}
            >
              {b.excursion_name}
            </Text>
            <Text
              style={[
                styles.tableCol,
                { width: "4%", fontSize: 11, textAlign: "center" },
              ]}
            >
              {b.num_people}
            </Text>

            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.clientName}>{b.client_name}</Text>
              <Text style={styles.clientContact}>
                {b.client_phone || "S/N"}
              </Text>
              <Text style={styles.clientEmail}>{b.client_email || ""}</Text>
            </View>

            <Text style={[styles.tableCol, { width: "10%" }]}>
              {b.guide_name || "---"}
            </Text>

            {/* CELDA DE IDIOMA */}
            <Text
              style={[
                styles.tableCol,
                { width: "8%", fontWeight: "bold", textAlign: "center" },
              ]}
            >
              {b.language || "---"}
            </Text>

            <View
              style={[styles.tableCol, { width: "28%", borderRightWidth: 0 }]}
            >
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                {b.pickup_address}
              </Text>
              <Text style={styles.cellDetail}>{b.pickup_location_detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  // --- AÑADE ESTA LÍNEA AQUÍ ABAJO ---
  const dateStr = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
  });

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [vehicles, setVehicles] = useState([]); // <--- Nuevo estado para los buses

  const now = new Date();
  const timestamp = `${now.toISOString().split("T")[0]}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargamos ambos al mismo tiempo
        const [bookingsRes, vehiclesRes] = await Promise.all([
          api.get("auth/bookings/"),
          api.get("auth/vehicles/"), // <--- Asegúrate de que esta ruta existe en tu API
        ]);
        setBookings(bookingsRes.data);
        setVehicles(vehiclesRes.data);
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchData();
  }, []);

  const groupedBookings = bookings.reduce((acc, booking) => {
    const driver = booking.driver_name || "Non assigné";
    if (!acc[driver]) acc[driver] = { services: [], totalPax: 0 };
    acc[driver].services.push(booking);
    acc[driver].totalPax += booking.num_people;
    return acc;
  }, {});

  // Función para generar el timestamp exacto (Año-Mes-Día_Hora-Min-Seg)
  const getPreciseTimestamp = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // 2026-03-01
    const time = now.getHours().toString().padStart(2, '0') + 'h' + 
                now.getMinutes().toString().padStart(2, '0') + 'm' + 
                now.getSeconds().toString().padStart(2, '0') + 's';
    return `${date}_${time}`;
  };
  
  // --- EXPORTAR SOLO UN CHÓFER A EXCEL ---
  const exportDriverToExcel = (driverName, services) => {
    const dataToExport = services.map((b) => ({
      Heure: b.time.substring(0, 5),
      Agence: b.agency_name,
      Excursion: b.excursion_name,
      Pax: b.num_people,
      Client: b.client_name,
      Telephone: b.client_phone,
      Guide: b.guide_name || "---",
      Langue: b.language,
      "Adresse de ramassage": b.pickup_address,
      "Detail Point": b.pickup_location_detail,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    const now = new Date();
    const timestamp = getPreciseTimestamp();
    XLSX.utils.book_append_sheet(workbook, worksheet, driverName);
    XLSX.writeFile(workbook, `Planning_${driverName}_${timestamp}.xlsx`);
    Swal.fire({
      icon: "success",
      title: `Excel de ${driverName} généré !`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch("auth/me/", formData);
      setUser({ ...user, ...response.data });
      setIsEditing(false);
      Swal.fire({
        icon: "success",
        title: "Profil mis à jour !",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Erreur lors de la mise à jour" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 relative">
      {/* --- SECCIÓN 1: PERFIL --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Bonjour, {user?.first_name || "Utilisateur"} ! 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Gestion de votre compte personnel
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all font-semibold border border-blue-100"
            >
              <Edit2 size={18} /> Modifier le profil
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg shadow-green-100"
              >
                <Save size={18} /> Enregistrer
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                <X size={18} /> Annuler
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mail size={20} className="text-blue-600" /> Informations
              Personnelles
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 font-medium">
                    {user?.first_name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Nom
                </label>
                {isEditing ? (
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 font-medium">
                    {user?.last_name || "---"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Téléphone
                </label>
                {isEditing ? (
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 font-medium">
                    {user?.phone || "Non renseigné"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100 text-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-600" /> Sécurité &
              Statut
            </h3>
            <div className="space-y-3 font-medium">
              <p className="text-gray-600">
                <span className="text-gray-400 text-xs uppercase block font-bold">
                  E-mail
                </span>{" "}
                {user?.email}
              </p>
              <p className="text-gray-600">
                <span className="text-gray-400 text-xs uppercase block font-bold">
                  Rôle
                </span>{" "}
                {user?.is_superuser ? "Administrateur" : "Standard"}
              </p>
              <div className="pt-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Compte Vérifié
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 2: TABLEAU DE SERVICE --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            Planning Journalier (Style Document)
          </h2>
        </div>

        {/* --- ⚠️ PEGA EL PANEL DE ALERTAS JUSTO AQUÍ --- */}
        {(() => {
          const plateCounts = Object.values(groupedBookings).reduce(
            (acc, driverGroup) => {
              const plate = driverGroup.services[0]?.vehicle_plate;
              if (plate) acc[plate] = (acc[plate] || 0) + 1;
              return acc;
            },
            {}
          );

          const duplicates = Object.keys(plateCounts).filter(
            (plate) => plateCounts[plate] > 1
          );

          if (duplicates.length > 0) {
            return (
              <div className="mb-4 p-4 bg-red-600 text-white rounded-md shadow-lg animate-bounce flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">
                    ⚠️ ERREUR D'AFFECTATION !
                  </h3>
                  <p className="text-sm">
                    Les immatriculations suivantes sont dupliquées :{" "}
                    <span className="font-mono underline">
                      {duplicates.join(", ")}
                    </span>
                    . Plusieurs chauffeurs ne peuvent pas conduire le même bus
                    aujourd'hui.
                  </p>
                </div>
                <div className="text-xs bg-white text-red-600 p-2 rounded font-bold uppercase">
                  Vérifier Django
                </div>
              </div>
            );
          }
          return null;
        })()}
        {/* --- FIN DEL PANEL DE ALERTAS --- */}

        {/* --- BOTÓN DE VALIDACIÓN DE GUÍAS --- */}
        {(() => {
          // Filtramos los servicios que no tienen guía asignado
          const servicesWithoutGuide = bookings.filter(
            (b) =>
              !b.guide_name || b.guide_name === "---" || b.guide_name === ""
          ).length;

          return (
            <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 border-l-4 border-blue-500 rounded-r-md print:hidden">
              <div>
                <h4 className="text-blue-800 font-bold flex items-center gap-2 text-sm uppercase">
                  🔍 Statut des Guides
                </h4>
                <p className="text-blue-600 text-xs mt-1">
                  {servicesWithoutGuide > 0
                    ? `Attention : ${servicesWithoutGuide} prestation(s) n'ont pas encore de guide.`
                    : "Félicitations ! Tous les services sont couverts par un guide."}
                </p>
              </div>

              <button
                onClick={() => {
                  if (servicesWithoutGuide > 0) {
                    Swal.fire({
                      title: "Attention !",
                      text: `Il manque ${servicesWithoutGuide} guides. Voulez-vous imprimer quand même ?`,
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Vérifier les vides",
                      cancelButtonText: "Ignorer",
                      confirmButtonColor: "#f97316",
                    });
                  } else {
                    Swal.fire({
                      title: "Tout est prêt !",
                      text: "La feuille de service est complète.",
                      icon: "success",
                      timer: 2000,
                      showConfirmButton: false,
                    });
                  }
                }}
                className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md ${
                  servicesWithoutGuide > 0
                    ? "bg-orange-500 text-white hover:bg-orange-600 animate-pulse"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {servicesWithoutGuide > 0
                  ? "⚠️ Manque de Guides"
                  : "✅ Guides OK"}
              </button>
            </div>
          );
        })()}

        {/* --- CABECERA CON CHIVATO DE MATRÍCULA DUPLICADA --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-white p-3 border-2 border-gray-800 rounded-sm mb-4">
          {(() => {
            // 1. Contamos cuántos chóferes tienen cada matrícula hoy
            const plateCounts = Object.values(groupedBookings).reduce(
              (acc, driverGroup) => {
                const plate = driverGroup.services[0]?.vehicle_plate;
                if (plate) acc[plate] = (acc[plate] || 0) + 1;
                return acc;
              },
              {}
            );

            // 2. Dibujamos los recuadros
            return Object.keys(groupedBookings).map((driverName) => {
              const mainService = groupedBookings[driverName].services[0];
              const plate = mainService?.vehicle_plate || "S/M";
              const route = mainService?.excursion_name || "---";

              // Si la matrícula se repite en otro chófer, activamos la alerta
              const isDuplicate = plateCounts[plate] > 1 && plate !== "S/M";

              return (
                <div
                  key={driverName}
                  className={`border-2 px-2 py-1 flex items-center shadow-sm transition-colors ${
                    isDuplicate
                      ? "border-red-600 bg-red-50 animate-pulse" // Alerta roja si está duplicado
                      : "border-gray-300 bg-gray-50"
                  }`}
                  title={
                    isDuplicate
                      ? "¡Atención! Este vehículo está asignado a más de un chófer"
                      : ""
                  }
                >
                  <p className="text-[10px] font-bold uppercase tracking-tight w-full">
                    <span
                      className={isDuplicate ? "text-red-700" : "text-gray-400"}
                    >
                      {isDuplicate ? "⚠️ Même Bus:" : "Minibus:"}
                    </span>
                    <span
                      className={`ml-1 ${isDuplicate ? "text-red-900" : "text-blue-800"}`}
                    >
                      {driverName}
                    </span>
                    <span className="text-gray-300 mx-2">|</span>
                    <span
                      className={`font-mono ${isDuplicate ? "text-red-700 font-black" : "text-gray-600"}`}
                    >
                      {plate}
                    </span>
                    <span className="text-gray-300 mx-2">|</span>
                    <span
                      className={isDuplicate ? "text-red-600" : "text-red-600"}
                    >
                      📍 {route}
                    </span>
                  </p>
                </div>
              );
            });
          })()}
        </div>

        <div className="text-center py-2 border-y-2 border-black my-6">
          <h1 className="text-2xl font-black uppercase tracking-[0.2em]">
            Le {new Date().toLocaleDateString("fr-FR")}
          </h1>
        </div>

        {/* --- TABLAS POR CONDUCTOR --- */}
        <div className="space-y-10">
          {" "}
          {/* Esto separa las tablas entre sí */}
          {Object.keys(groupedBookings).map((driver) => (
            <div
              key={driver}
              className={`driver-card-${driver.replace(/\s+/g, "-")} bg-white border-2 border-gray-800 shadow-sm overflow-hidden mb-10`}
            >
              {/* Encabezado Conductor con BOTONES */}
              <div className="grid grid-cols-12 bg-gray-100 border-b-2 border-gray-800 items-center">
                <div className="col-span-3 p-3 border-r-2 border-gray-800 flex flex-col items-center justify-center font-black text-xl italic uppercase">
                  <span>{driver}</span>
                  {/* BOTONES DE ACCIÓN PARA ESTE CHÓFER ESPECÍFICO */}
                  <div className="flex gap-2 mt-2 print:hidden">
                    <button
                      onClick={() =>
                        exportDriverToExcel(
                          driver,
                          groupedBookings[driver].services
                        )
                      }
                      className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700 transition-colors"
                      title="Exporter Excel pour ce chauffeur"
                    >
                      <span className="text-sm">📊 Excel</span>
                    </button>
                    {/* BOTÓN PDF CORREGIDO */}
                    {/* BOTÓN PDF REAL */}
                    <PDFDownloadLink
                      document={
                        <DriverPDF
                          driverName={driver}
                          data={groupedBookings[driver]}
                          date={dateStr}
                        />
                      }
                      fileName={`Planning_${driver.replace(/\s+/g, '_')}_${getPreciseTimestamp()}.pdf`}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-700"
                    >
                      {({ loading }) =>
                        loading ? "Génération..." : "📄 Télécharger PDF"
                      }
                    </PDFDownloadLink>
                  </div>
                </div>

                <div className="col-span-7 p-2 text-center text-[10px] font-bold self-center tracking-widest uppercase">
                  PLANNING DES PRESTATIONS ET RAMASSAGE
                </div>

                <div className="col-span-2 p-2 border-l-2 border-gray-800 text-center bg-yellow-50">
                  <span className="text-[10px] block font-bold leading-none uppercase">
                    Total Pax
                  </span>
                  <span className="text-2xl font-black">
                    {groupedBookings[driver].totalPax}
                  </span>
                </div>
              </div>

              {/* Tabla de Datos */}
              <table className="min-w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-800">
                    <th className="border-r border-gray-800 px-2 py-1 w-16">
                      Heure
                    </th>
                    <th className="border-r border-gray-800 px-2 py-1 w-12">
                      Agen
                    </th>
                    <th className="border-r border-gray-800 px-2 py-1">
                      Excursion
                    </th>
                    <th className="border-r border-gray-800 px-2 py-1 w-8 font-black">
                      Pax
                    </th>
                    <th className="border-r border-gray-800 px-2 py-1">
                      Client
                    </th>
                    <th className="border-r border-gray-800 px-2 py-1 w-16">
                      Guide
                    </th>
                    <th className="border-r border-gray-800 px-2 py-1 w-12 text-[9px]">
                      Langue
                    </th>
                    <th className="px-2 py-1">Adresse / Prise en charge</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedBookings[driver].services.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-gray-400 last:border-0"
                    >
                      <td className="border-r border-gray-800 px-2 py-2 font-black text-center bg-yellow-50 text-sm">
                        {b.time.substring(0, 5)}
                      </td>
                      <td className="border-r border-gray-800 px-2 py-2 text-center font-bold text-blue-600">
                        {b.agency_name}
                      </td>
                      <td className="border-r border-gray-800 px-2 py-2 font-black uppercase text-gray-700">
                        {b.excursion_name}
                      </td>
                      <td
                        className={`border-r border-gray-800 px-2 py-2 text-center font-black text-lg ${
                          b.num_people >= 15
                            ? "bg-red-100 text-red-700 animate-pulse"
                            : "bg-gray-50 text-gray-800"
                        }`}
                      >
                        {b.num_people}
                      </td>
                      <td className="border-r border-gray-800 px-2 py-2">
                        <div className="font-bold uppercase leading-tight text-[10px]">
                          {b.client_name}
                        </div>
                        <div className="text-[9px] text-blue-700 font-bold mt-1">
                          📞 {b.client_phone || "S/N"}
                        </div>
                        <div className="text-[8px] text-gray-400 italic">
                          {b.client_email}
                        </div>
                      </td>
                      <td className="border-r border-gray-800 px-2 py-2 text-center font-bold italic text-purple-700">
                        {b.guide_name || "---"}
                      </td>
                      <td className="border-r border-gray-800 px-2 py-2 text-center font-black italic">
                        {b.language}
                      </td>
                      <td className="px-2 py-2">
                        <div className="font-bold text-gray-900 leading-none">
                          {b.pickup_address}
                        </div>
                        <div className="text-[10px] text-red-600 font-black uppercase italic mt-1 leading-none">
                          {b.pickup_location_detail}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* --- BOTÓN FLOTANTE CORREGIDO --- */}
      <button
        onClick={() => window.print()}
        className="bottom-10 right-10 bg-orange-600 text-white px-6 py-3 rounded-full shadow-2xl hover:scale-110 transition-transform font-bold flex items-center gap-2 z-50 print:hidden"
      >
        <span>🖨️ Imprimer la feuille</span>
      </button>
    </div>
  );
};

export default Dashboard;
