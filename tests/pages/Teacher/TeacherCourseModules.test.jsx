import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import TeacherCourseModules from 'Se_Frontend/src/pages/Teacher/TeacherCourseModules';
import { CourseProvider } from 'Se_Frontend/src/contexts/CourseContext';
import * as moduleService from 'Se_Frontend/src/services/moduleService';

// Mock all required services
vi.mock('Se_Frontend/src/services/moduleService', () => ({
  getModulesByCourseId: vi.fn(),
  createModule: vi.fn(),
  getModuleContents: vi.fn(),
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
  addModuleContent: vi.fn(),
  deleteModuleContent: vi.fn()
}));

// Mock components
vi.mock('Se_Frontend/src/components/common/layout/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('Se_Frontend/src/components/common/layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('Se_Frontend/src/components/common/layout/MobileNavbar', () => ({
  default: () => <div data-testid="mobile-navbar">MobileNavbar</div>
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('TeacherCourseModules Component', () => {
  const mockSelectedCourse = {
    id: 1,
    name: 'Test Course',
    code: 'TEST101'
  };

  const mockModules = [
    {
      id: 1,
      title: 'Module 1', // Changed from name to title to match component
      description: 'Description 1',
      resources: [
        { content_id: 1, title: 'Resource 1', link: 'http://test.com/1' } // Changed name to title
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Module 2', // Changed from name to title
      description: 'Description 2',
      resources: [],
      createdAt: new Date().toISOString()
    }
  ];

  const renderComponent = (selectedCourse = mockSelectedCourse) => {
    return render(
      <MemoryRouter>
        <CourseProvider value={{ selectedCourse, setSelectedCourse: vi.fn() }}>
          <TeacherCourseModules />
        </CourseProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    moduleService.getModulesByCourseId.mockResolvedValue(mockModules);
    moduleService.getModuleContents.mockResolvedValue({ contents: [] });
  });

  describe('Initial Render', () => {
    it('should render basic components', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-navbar')).toBeInTheDocument();
      });
    });

    it('should redirect to dashboard if no course selected', async () => {
      renderComponent(null);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/Teacher/Dashboard');
      });
    });

    it('should display course modules', async () => {
      renderComponent();
      
      await waitFor(() => {
        // Use getByRole to find module title headings
        const moduleElements = screen.getAllByRole('heading', { level: 3 });
        
        // Check if module titles are present in the headings
        expect(moduleElements.some(el => el.textContent.includes('Module 1'))).toBe(true);
        expect(moduleElements.some(el => el.textContent.includes('Module 2'))).toBe(true);
      });
    });
  });

  describe('Module Management', () => {
    it('should create a new module', async () => {
      const newModule = {
        id: 3,
        name: 'New Module',
        description: 'New Description'
      };

      moduleService.createModule.mockResolvedValueOnce(newModule);

      renderComponent();

      const addButton = await screen.findByRole('button', {
        name: /create first module/i
      });
      fireEvent.click(addButton);

      const titleInput = screen.getByLabelText(/title/i);
      const descInput = screen.getByLabelText(/description/i);
      
      fireEvent.change(titleInput, { target: { value: 'New Module' }});
      fireEvent.change(descInput, { target: { value: 'New Description' }});
      
      const submitButton = screen.getByRole('button', { name: /create module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(moduleService.createModule).toHaveBeenCalledWith(
          expect.any(Number),
          expect.objectContaining({
            name: 'New Module',
            description: 'New Description'
          })
        );
      });
    });

    it('should delete a module', async () => {
      moduleService.deleteModule.mockResolvedValueOnce({ success: true });
      
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Module 1')).toBeInTheDocument();
      });

      const menuButton = screen.getAllByRole('button', { name: /menu/i })[0];
      fireEvent.click(menuButton);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(moduleService.deleteModule).toHaveBeenCalledWith(1);
      });
    });

    it('should update a module', async () => {
      const updatedModule = {
        id: 1,
        title: 'Updated Module', // Changed from name to title
        description: 'Updated Description'
      };

      moduleService.updateModule.mockResolvedValueOnce(updatedModule);

      renderComponent();

      const editButton = await screen.findByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      // Use findByDisplayValue with function matcher
      const titleInput = await screen.findByDisplayValue((value) => {
        return value.includes('Module 1');
      });
      fireEvent.change(titleInput, { target: { value: 'Updated Module' }});
      
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(moduleService.updateModule).toHaveBeenCalled();
        expect(screen.getByText('Module updated successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when module creation fails', async () => {
      moduleService.createModule.mockRejectedValueOnce(new Error('Failed to create module'));
      
      renderComponent();

      const addButton = await screen.findByRole('button', { name: /create first module/i });
      fireEvent.click(addButton);

      const titleInput = screen.getByLabelText(/title/i);
      const descInput = screen.getByLabelText(/description/i);
      
      fireEvent.change(titleInput, { target: { value: 'Test' }});
      fireEvent.change(descInput, { target: { value: 'Test' }});

      const submitButton = screen.getByRole('button', { name: /create module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create module/i)).toBeInTheDocument();
      });
    });

    it('should display error when fetching modules fails', async () => {
      moduleService.getModulesByCourseId.mockRejectedValueOnce(
        new Error('Failed to fetch modules')
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/failed to load modules/i)).toBeInTheDocument();
      });
    });
  });

  describe('Module Content Management', () => {
    it('should add content to a module', async () => {
      const newContent = {
        id: 1,
        title: 'New Content',
        link: 'http://test.com/content'
      };

      moduleService.addModuleContent.mockResolvedValueOnce(newContent);
      moduleService.getModuleContents.mockResolvedValueOnce({ contents: [newContent] });

      renderComponent();

      const addContentButton = await screen.findByTitle('Add Content');
      fireEvent.click(addContentButton);

      const titleInput = await screen.findByPlaceholderText(/content title/i);
      const linkInput = await screen.findByPlaceholderText(/content link/i);
      
      fireEvent.change(titleInput, { target: { value: newContent.title }});
      fireEvent.change(linkInput, { target: { value: newContent.link }});
      
      const submitButton = screen.getByRole('button', { name: /add content/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(moduleService.addModuleContent).toHaveBeenCalled();
        expect(screen.getByText('Learning resource added successfully')).toBeInTheDocument();
      });
    });

    it('should delete content from a module', async () => {
      moduleService.deleteModuleContent.mockResolvedValueOnce({ success: true });
      
      renderComponent();

      const deleteButton = await screen.findByTitle('Delete resource');
      fireEvent.click(deleteButton);

      const confirmButton = await screen.findByText(/confirm/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(moduleService.deleteModuleContent).toHaveBeenCalled();
        expect(screen.getByText('Resource deleted successfully')).toBeInTheDocument();
      });
    });
  });
});
