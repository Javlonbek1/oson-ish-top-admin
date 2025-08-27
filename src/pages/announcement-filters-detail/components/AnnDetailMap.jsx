export default function LocationMap({ ann }) {
  const lat = ann.lat;
  const lon = ann.lon;

  const mapUrl = `https://www.google.com/maps?q=${lat},${lon}&hl=uz&z=14&output=embed`;

  return (
    <div style={{ width: "100%", height: "350px" }}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: "10px" }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Location Map"
      ></iframe>
    </div>
  );
}
