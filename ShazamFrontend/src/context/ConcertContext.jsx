import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { concerts as initialConcerts } from '../data/concertData';
import { useAuth } from './AuthContext';

const LOCAL_STORAGE_KEY = 'concerts';

const ConcertContext = createContext();

export const useConcerts = () => {
  const context = useContext(ConcertContext);
  if (!context) {
    throw new Error('useConcerts must be used within a ConcertProvider');
  }
  return context;
};

export const ConcertProvider = ({ children }) => {
  // Initialize with initial concerts data
  const [concerts, setConcerts] = useState(() => {
    // Try to get stored concerts from localStorage
    const storedConcerts = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedConcerts) {
      try {
        const parsed = JSON.parse(storedConcerts);
        // Merge with initial concerts, preferring stored ones
        const mergedConcerts = [...initialConcerts];
        parsed.forEach(storedConcert => {
          const index = mergedConcerts.findIndex(c => c.id === storedConcert.id);
          if (index >= 0) {
            mergedConcerts[index] = storedConcert;
          } else {
            mergedConcerts.push(storedConcert);
          }
        });
        return mergedConcerts;
      } catch (e) {
        console.error('Error parsing stored concerts:', e);
        return initialConcerts;
      }
    }
    return initialConcerts;
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();

  // Save concerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(concerts));
  }, [concerts]);

  // Helper function to get headers
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // Fetch concerts on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchConcerts();
    }
  }, [isAuthenticated, token]);

  const fetchConcerts = async () => {
    if (!isAuthenticated || !token) {
      console.log('User not authenticated or no token available, skipping fetch');
      return;
    }

    console.log('Fetching concerts with token:', token);
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      console.log('Request headers:', headers);

      const response = await fetch('http://localhost:8080/api/concerts', {
        headers,
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        toast.error('Session expired. Please sign in again.');
        window.location.href = '/signin';
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch concerts: ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched concerts:', data);
      setConcerts(data);
    } catch (error) {
      console.error('Error fetching concerts:', error);
      toast.error(error.message || 'Failed to load concerts');
      // If we get a malformed JWT error, clear the token and redirect to login
      if (error.message?.includes('JWT')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/signin';
      }
    } finally {
      setLoading(false);
    }
  };

  const createTicketPage = async (concertId, ticketData) => {
    if (!isAuthenticated || !token) throw new Error('Authentication required');

    try {
      // Format the request to match backend expectations
      const ticketRequest = {
        concertId: concertId.toString(),
        pageType: ticketData.ticketPageType,
        availableFrom: ticketData.ticketPageType === 'AVAILABLE_LATER' ? 
          new Date(ticketData.availableFrom).toISOString() : null,
        ticketTypes: ticketData.ticketPageType === 'BOOKABLE' ? 
          ticketData.ticketTypes.map(type => ({
            typeName: type.typeName,
            price: parseFloat(type.price),
            quantity: parseInt(type.quantity)
          })) : []
      };

      console.log('Creating ticket with data:', JSON.stringify(ticketRequest, null, 2));

      const response = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'X-Timezone-Offset': '-330' // IST is UTC+5:30, so offset is -330 minutes
        },
        credentials: 'include',
        body: JSON.stringify(ticketRequest)
      });

      console.log('Ticket creation response status:', response.status);
      const responseText = await response.text();
      console.log('Ticket creation response:', responseText);

      if (response.status === 401) {
        toast.error('Session expired. Please sign in again.');
        window.location.href = '/signin';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = responseText || 'Failed to create ticket page';
        throw new Error(error);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse ticket response:', e);
        throw new Error('Invalid response from server');
      }

      return responseData;
    } catch (error) {
      console.error('Error creating ticket page:', error);
      throw error;
    }
  };

  const addConcert = async (concertData) => {
    if (!isAuthenticated || !token) throw new Error('Authentication required');

    setLoading(true);
    try {
      // Generate a URL-friendly slug from the concert name
      const slug = concertData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Format the concert data to match backend expectations
      const newConcert = {
        name: concertData.name,
        location: concertData.location,
        date: new Date(concertData.date).toISOString().split('T')[0],
        time: concertData.time,
        description: concertData.description || 'No description available',
        shortDescription: concertData.shortDescription || concertData.description?.slice(0, 100) + '...' || 'No description available',
        artists: concertData.artists,
        image: concertData.image || '/concert-placeholder.jpg',
        gradient: concertData.gradient || ['from-violet-600', 'to-indigo-500'],
        slug: slug,
        venue: concertData.location,
        ticketLink: `/book-ticket/${slug}` // Set default internal booking link
      };

      console.log('Creating concert with data:', JSON.stringify(newConcert, null, 2));

      // Create concert in backend
      const concertResponse = await fetch('http://localhost:8080/api/concerts', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(newConcert)
      });

      if (!concertResponse.ok) {
        const error = await concertResponse.text();
        console.error('Backend error:', error);
        throw new Error(error || 'Failed to create concert');
      }

      const createdConcert = await concertResponse.json();
      
      // For BOOKABLE concerts, ticket creation is mandatory
      if (concertData.ticketPageType === 'BOOKABLE') {
        try {
          const ticketResponse = await createTicketPage(createdConcert.id, concertData);
          const bookingUrl = ticketResponse.bookingUrl || `/book-ticket/${slug}`;
          
          // Update the concert with the booking URL
          createdConcert.ticketLink = bookingUrl;

          // Update the concert in the backend with the new ticket link
          const updateResponse = await fetch(`http://localhost:8080/api/concerts/${createdConcert.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({ ...createdConcert, ticketLink: bookingUrl })
          });

          if (!updateResponse.ok) {
            throw new Error('Failed to update concert with ticket link');
          }
        } catch (error) {
          console.error('Error creating ticket page:', error);
          // For BOOKABLE concerts, if ticket creation fails, delete the concert
          await fetch(`http://localhost:8080/api/concerts/${createdConcert.id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
          });
          throw new Error('Failed to create ticket page: ' + error.message);
        }
      } else if (concertData.ticketPageType) {
        // For other ticket types (COMING_SOON, AVAILABLE_LATER), try to create ticket but don't fail if it errors
        try {
          const ticketResponse = await createTicketPage(createdConcert.id, concertData);
          const bookingUrl = ticketResponse.bookingUrl || `/book-ticket/${slug}`;
          createdConcert.ticketLink = bookingUrl;

          await fetch(`http://localhost:8080/api/concerts/${createdConcert.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({ ...createdConcert, ticketLink: bookingUrl })
          });
        } catch (error) {
          console.error('Error creating ticket page:', error);
          // Don't throw for non-BOOKABLE concerts
        }
      }

      // Update local state
      setConcerts(prev => [...prev, createdConcert]);

      return { concert: createdConcert };
    } catch (error) {
      console.error('Error in addConcert:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateConcert = async (id, concertData) => {
    if (!isAuthenticated || !token) throw new Error('Authentication required');

    setLoading(true);
    try {
      // Generate a URL-friendly slug from the concert name
      const slug = concertData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Format concert data
      const updateData = {
        name: concertData.name,
        location: concertData.location,
        date: new Date(concertData.date).toISOString().split('T')[0],
        time: concertData.time,
        description: concertData.description || 'No description available',
        shortDescription: concertData.shortDescription || concertData.description?.slice(0, 100) + '...' || 'No description available',
        artists: concertData.artists,
        image: concertData.image || '/concert-placeholder.jpg',
        gradient: concertData.gradient || ['from-violet-600', 'to-indigo-500'],
        venue: concertData.location,
        slug: slug,
        ticketLink: concertData.ticketLink || `/book-ticket/${slug}`
      };

      // Update concert in backend
      const response = await fetch(`http://localhost:8080/api/concerts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (response.status === 401) {
        toast.error('Session expired. Please sign in again.');
        window.location.href = '/signin';
        throw new Error('Authentication required');
      }

      if (!response.ok) throw new Error('Failed to update concert');
      
      const updatedConcert = await response.json();

      // For BOOKABLE concerts, ticket creation is mandatory
      if (concertData.ticketPageType === 'BOOKABLE') {
        try {
          const ticketResponse = await createTicketPage(id.toString(), concertData);
          const bookingUrl = ticketResponse.bookingUrl || `/book-ticket/${slug}`;
          updatedConcert.ticketLink = bookingUrl;

          // Update the concert again with the new ticket link
          const updateResponse = await fetch(`http://localhost:8080/api/concerts/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({ ...updatedConcert, ticketLink: bookingUrl })
          });

          if (!updateResponse.ok) {
            throw new Error('Failed to update concert with ticket link');
          }
        } catch (error) {
          console.error('Error creating ticket page:', error);
          throw new Error('Failed to create ticket page: ' + error.message);
        }
      } else if (concertData.ticketPageType) {
        // For other ticket types (COMING_SOON, AVAILABLE_LATER), try to create ticket but don't fail if it errors
        try {
          const ticketResponse = await createTicketPage(id.toString(), concertData);
          const bookingUrl = ticketResponse.bookingUrl || `/book-ticket/${slug}`;
          updatedConcert.ticketLink = bookingUrl;

          await fetch(`http://localhost:8080/api/concerts/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({ ...updatedConcert, ticketLink: bookingUrl })
          });
        } catch (error) {
          console.error('Error creating ticket page:', error);
          // Don't throw for non-BOOKABLE concerts
        }
      }
      
      // Update local state
      setConcerts(prev => prev.map(c => c.id === id ? updatedConcert : c));
      
      return updatedConcert;
    } catch (error) {
      console.error('Error updating concert:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeConcert = async (id) => {
    if (!isAuthenticated || !token) throw new Error('Authentication required');

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/concerts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (response.status === 401) {
        toast.error('Session expired. Please sign in again.');
        window.location.href = '/signin';
        throw new Error('Authentication required');
      }

      if (!response.ok) throw new Error('Failed to delete concert');
      
      setConcerts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting concert:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getConcertBySlug = (slug) => {
    return concerts.find(c => c.slug === slug);
  };

  // Filter out hardcoded concerts for user view
  const getPublicConcerts = () => {
    // Return all concerts without filtering
    return concerts;
  };

  const getTicketDetails = async (concertId) => {
    if (!isAuthenticated || !token) throw new Error('Authentication required');

    try {
      const response = await fetch(`http://localhost:8080/api/tickets/concert/${concertId}`, {
        headers: {
          ...getAuthHeaders(),
          'X-Timezone-Offset': '-330' // IST is UTC+5:30, so offset is -330 minutes
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        toast.error('Session expired. Please sign in again.');
        window.location.href = '/signin';
        throw new Error('Authentication required');
      }

      if (response.status === 404) {
        // No ticket page exists yet
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      return null;
    }
  };

  return (
    <ConcertContext.Provider value={{
      concerts: getPublicConcerts(), // Use filtered concerts for public view
      loading,
      addConcert,
      updateConcert,
      removeConcert,
      fetchConcerts,
      getConcertBySlug,
      getTicketDetails
    }}>
      {children}
    </ConcertContext.Provider>
  );
};

export default ConcertContext; 