import React, { useState, useCallback } from "react"
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api"
import "./GoogleMap.scss"

interface GoogleMapComponentProps {
  address: string
  className?: string
  height?: string
  width?: string
}

const mapContainerStyle = {
  height: "400px",
  width: "100%",
}

const defaultCenter = {
  lat: 10.8231, // Ho Chi Minh City default
  lng: 106.6297,
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  address,
  className = "",
  height = "400px",
  width = "100%",
}) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const customMapContainerStyle = {
    ...mapContainerStyle,
    height,
    width,
  }

  // Geocode address to get coordinates
  const geocodeAddress = useCallback(async (address: string) => {
    try {
      const geocoder = new google.maps.Geocoder()
      const result = await new Promise<google.maps.GeocoderResult[]>(
        (resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results && results.length > 0) {
              resolve(results)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          })
        }
      )

      if (result[0]?.geometry?.location) {
        const location = result[0].geometry.location
        const newCenter = {
          lat: location.lat(),
          lng: location.lng(),
        }
        setMapCenter(newCenter)
      }
    } catch (error) {
      console.error("Error geocoding address:", error)
      // Keep default center if geocoding fails
    } finally {
      setIsLoading(false)
    }
  }, [])

  const onMapLoad = useCallback(
    (_map: google.maps.Map) => {
      // Geocode the address when map loads
      if (address && address.trim()) {
        geocodeAddress(address)
      } else {
        setIsLoading(false)
      }
    },
    [address, geocodeAddress]
  )

  const onMarkerClick = useCallback(() => {
    setIsInfoWindowOpen(true)
  }, [])

  const onInfoWindowClose = useCallback(() => {
    setIsInfoWindowOpen(false)
  }, [])

  // Show error if API key is missing or invalid
  if (hasError) {
    return (
      <div
        className={`google-map-error ${className}`}
        style={{ height: customMapContainerStyle.height }}
      >
        <div className="error-icon">🗺️</div>
        <div>Unable to load map</div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          Failed to load Google Maps
        </div>
      </div>
    )
  }

  return (
    <div className={`google-map-container ${className}`}>
      <GoogleMap
        mapContainerStyle={customMapContainerStyle}
        center={mapCenter}
        zoom={15}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {!isLoading && (
          <>
            <Marker
              position={mapCenter}
              onClick={onMarkerClick}
              title={address}
            />
            {isInfoWindowOpen && (
              <InfoWindow position={mapCenter} onCloseClick={onInfoWindowClose}>
                <div style={{ maxWidth: "200px" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
                    Program Location
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                    {address}
                  </p>
                </div>
              </InfoWindow>
            )}
          </>
        )}
      </GoogleMap>
    </div>
  )
}

export default GoogleMapComponent
