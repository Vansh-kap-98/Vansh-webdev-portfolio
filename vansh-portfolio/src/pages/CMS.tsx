import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMSAuthStore } from '@/stores/cmsAuthStore';
import { useContentStore, ExpertiseItem } from '@/stores/contentStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Save, LogOut, Home, RotateCcw, Plus, Trash2, X } from 'lucide-react';

const CMS = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, login, logout, password, updatePassword } = useCMSAuthStore();
  const content = useContentStore();
  
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localContent, setLocalContent] = useState({
    heroHeading: content.heroHeading.join(' '),
    heroSubtext: content.heroSubtext,
    heroCornerLabel: content.heroCornerLabel,
    heroCornerSublabel: content.heroCornerSublabel,
    aboutLabel: content.aboutLabel,
    aboutText: content.aboutText,
    aboutExpertise: content.aboutExpertise,
    aboutTechnologies: content.aboutTechnologies,
    headerLogo: content.headerLogo,
    footerHeading: content.footerHeading,
    footerEmail: content.footerEmail,
    footerCopyright: content.footerCopyright,
    footerTagline: content.footerTagline,
    aboutPageHeading: content.aboutPageHeading,
    aboutPageSubtext: content.aboutPageSubtext,
    aboutBackgroundText: content.aboutBackgroundText,
    aboutApproachText: content.aboutApproachText,
    processPageHeading: content.processPageHeading,
    processPageSubtext: content.processPageSubtext,
    contactPageHeading: content.contactPageHeading,
    contactPageSubtext: content.contactPageSubtext,
    contactEmail: content.contactEmail,
    contactLocation: content.contactLocation,
    contactResponseTime: content.contactResponseTime,
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newTechnology, setNewTechnology] = useState('');

  useEffect(() => {
    setLocalContent({
      heroHeading: content.heroHeading.join(' '),
      heroSubtext: content.heroSubtext,
      heroCornerLabel: content.heroCornerLabel,
      heroCornerSublabel: content.heroCornerSublabel,
      aboutLabel: content.aboutLabel,
      aboutText: content.aboutText,
      aboutExpertise: content.aboutExpertise,
      aboutTechnologies: content.aboutTechnologies,
      headerLogo: content.headerLogo,
      footerHeading: content.footerHeading,
      footerEmail: content.footerEmail,
      footerCopyright: content.footerCopyright,
      footerTagline: content.footerTagline,
      aboutPageHeading: content.aboutPageHeading,
      aboutPageSubtext: content.aboutPageSubtext,
      aboutBackgroundText: content.aboutBackgroundText,
      aboutApproachText: content.aboutApproachText,
      processPageHeading: content.processPageHeading,
      processPageSubtext: content.processPageSubtext,
      contactPageHeading: content.contactPageHeading,
      contactPageSubtext: content.contactPageSubtext,
      contactEmail: content.contactEmail,
      contactLocation: content.contactLocation,
      contactResponseTime: content.contactResponseTime,
    });
  }, [content]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginPassword);
    if (success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome to the CMS portal',
      });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Incorrect password',
        variant: 'destructive',
      });
    }
    setLoginPassword('');
  };

  const handleSaveContent = () => {
    content.updateContent('heroHeading', localContent.heroHeading.split(' '));
    content.updateContent('heroSubtext', localContent.heroSubtext);
    content.updateContent('heroCornerLabel', localContent.heroCornerLabel);
    content.updateContent('heroCornerSublabel', localContent.heroCornerSublabel);
    content.updateContent('aboutLabel', localContent.aboutLabel);
    content.updateContent('aboutText', localContent.aboutText);
    content.updateContent('aboutExpertise', localContent.aboutExpertise);
    content.updateContent('aboutTechnologies', localContent.aboutTechnologies);
    content.updateContent('headerLogo', localContent.headerLogo);
    content.updateContent('footerHeading', localContent.footerHeading);
    content.updateContent('footerEmail', localContent.footerEmail);
    content.updateContent('footerCopyright', localContent.footerCopyright);
    content.updateContent('footerTagline', localContent.footerTagline);
    content.updateContent('aboutPageHeading', localContent.aboutPageHeading);
    content.updateContent('aboutPageSubtext', localContent.aboutPageSubtext);
    content.updateContent('aboutBackgroundText', localContent.aboutBackgroundText);
    content.updateContent('aboutApproachText', localContent.aboutApproachText);
    content.updateContent('processPageHeading', localContent.processPageHeading);
    content.updateContent('processPageSubtext', localContent.processPageSubtext);
    content.updateContent('contactPageHeading', localContent.contactPageHeading);
    content.updateContent('contactPageSubtext', localContent.contactPageSubtext);
    content.updateContent('contactEmail', localContent.contactEmail);
    content.updateContent('contactLocation', localContent.contactLocation);
    content.updateContent('contactResponseTime', localContent.contactResponseTime);
    
    toast({
      title: 'Content Saved',
      description: 'All changes have been saved successfully',
    });
  };

  const handleResetContent = () => {
    if (confirm('Are you sure you want to reset all content to defaults?')) {
      content.resetContent();
      toast({
        title: 'Content Reset',
        description: 'All content has been reset to defaults',
      });
    }
  };

  const handleUpdatePassword = () => {
    if (!newPassword) {
      toast({
        title: 'Error',
        description: 'Password cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    updatePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    toast({
      title: 'Password Updated',
      description: 'Your password has been changed successfully',
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
  };

  const handleAddExpertise = () => {
    setLocalContent({
      ...localContent,
      aboutExpertise: [...localContent.aboutExpertise, { text: '', color: '#2DD4BF' }],
    });
  };

  const handleRemoveExpertise = (index: number) => {
    setLocalContent({
      ...localContent,
      aboutExpertise: localContent.aboutExpertise.filter((_, i) => i !== index),
    });
  };

  const handleUpdateExpertise = (index: number, field: 'text' | 'color', value: string) => {
    const updated = [...localContent.aboutExpertise];
    updated[index] = { ...updated[index], [field]: value };
    setLocalContent({ ...localContent, aboutExpertise: updated });
  };

  const handleAddTechnology = () => {
    if (newTechnology.trim()) {
      setLocalContent({
        ...localContent,
        aboutTechnologies: [...localContent.aboutTechnologies, newTechnology.trim()],
      });
      setNewTechnology('');
    }
  };

  const handleRemoveTechnology = (index: number) => {
    setLocalContent({
      ...localContent,
      aboutTechnologies: localContent.aboutTechnologies.filter((_, i) => i !== index),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="cms-portal min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">CMS Portal</CardTitle>
            <CardDescription>Enter your password to access the content management system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Website
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="cms-portal min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">CMS Portal</h1>
            <p className="text-sm text-muted-foreground">Manage your website content</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveContent}>
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </Button>
            <Button variant="outline" onClick={() => window.open('/', '_blank')}>
              <Home className="mr-2 h-4 w-4" />
              View Website
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="home">Main Page</TabsTrigger>
            <TabsTrigger value="about">About Page</TabsTrigger>
            <TabsTrigger value="process">Process Page</TabsTrigger>
            <TabsTrigger value="contact">Contact Page</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outline" onClick={handleResetContent}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Header Section</CardTitle>
                <CardDescription>Edit the header/navigation content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headerLogo">Logo Text</Label>
                  <Input
                    id="headerLogo"
                    value={localContent.headerLogo}
                    onChange={(e) => setLocalContent({ ...localContent, headerLogo: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Edit the main hero section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroHeading">Hero Heading (space-separated words)</Label>
                  <Input
                    id="heroHeading"
                    value={localContent.heroHeading}
                    onChange={(e) => setLocalContent({ ...localContent, heroHeading: e.target.value })}
                    placeholder="WE BUILD DIGITAL WORLDS"
                  />
                  <p className="text-xs text-muted-foreground">
                    Each word will be animated separately. Example: "WE BUILD DIGITAL WORLDS"
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtext">Hero Subtext</Label>
                  <Input
                    id="heroSubtext"
                    value={localContent.heroSubtext}
                    onChange={(e) => setLocalContent({ ...localContent, heroSubtext: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroCornerLabel">Corner Label</Label>
                    <Input
                      id="heroCornerLabel"
                      value={localContent.heroCornerLabel}
                      onChange={(e) => setLocalContent({ ...localContent, heroCornerLabel: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroCornerSublabel">Corner Sublabel</Label>
                    <Input
                      id="heroCornerSublabel"
                      value={localContent.heroCornerSublabel}
                      onChange={(e) => setLocalContent({ ...localContent, heroCornerSublabel: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Edit the about section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aboutLabel">Section Label</Label>
                  <Input
                    id="aboutLabel"
                    value={localContent.aboutLabel}
                    onChange={(e) => setLocalContent({ ...localContent, aboutLabel: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutText">About Text</Label>
                  <Textarea
                    id="aboutText"
                    value={localContent.aboutText}
                    onChange={(e) => setLocalContent({ ...localContent, aboutText: e.target.value })}
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer Section</CardTitle>
                <CardDescription>Edit the footer content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="footerHeading">Footer Heading</Label>
                  <Input
                    id="footerHeading"
                    value={localContent.footerHeading}
                    onChange={(e) => setLocalContent({ ...localContent, footerHeading: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerEmail">Contact Email</Label>
                  <Input
                    id="footerEmail"
                    type="email"
                    value={localContent.footerEmail}
                    onChange={(e) => setLocalContent({ ...localContent, footerEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerCopyright">Copyright Text</Label>
                  <Input
                    id="footerCopyright"
                    value={localContent.footerCopyright}
                    onChange={(e) => setLocalContent({ ...localContent, footerCopyright: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerTagline">Footer Tagline</Label>
                  <Input
                    id="footerTagline"
                    value={localContent.footerTagline}
                    onChange={(e) => setLocalContent({ ...localContent, footerTagline: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>About Page</CardTitle>
                <CardDescription>Edit the About page content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aboutPageHeading">Page Heading</Label>
                  <Input
                    id="aboutPageHeading"
                    value={localContent.aboutPageHeading}
                    onChange={(e) => setLocalContent({ ...localContent, aboutPageHeading: e.target.value })}
                    placeholder="Who I Am"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutPageSubtext">Page Subtext</Label>
                  <Textarea
                    id="aboutPageSubtext"
                    value={localContent.aboutPageSubtext}
                    onChange={(e) => setLocalContent({ ...localContent, aboutPageSubtext: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutBackgroundText">Background Section Text</Label>
                  <Textarea
                    id="aboutBackgroundText"
                    value={localContent.aboutBackgroundText}
                    onChange={(e) => setLocalContent({ ...localContent, aboutBackgroundText: e.target.value })}
                    rows={4}
                    placeholder="Describe your background and experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutApproachText">Approach Section Text</Label>
                  <Textarea
                    id="aboutApproachText"
                    value={localContent.aboutApproachText}
                    onChange={(e) => setLocalContent({ ...localContent, aboutApproachText: e.target.value })}
                    rows={5}
                    placeholder="Describe your approach to work"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expertise Section</CardTitle>
                <CardDescription>Manage your expertise bullets with custom colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {localContent.aboutExpertise.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.text}
                        onChange={(e) => handleUpdateExpertise(index, 'text', e.target.value)}
                        placeholder="Expertise title"
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Bullet Color:</Label>
                        <input
                          type="color"
                          value={item.color}
                          onChange={(e) => handleUpdateExpertise(index, 'color', e.target.value)}
                          className="w-12 h-8 rounded cursor-pointer"
                        />
                        <Input
                          value={item.color}
                          onChange={(e) => handleUpdateExpertise(index, 'color', e.target.value)}
                          placeholder="#2DD4BF"
                          className="font-mono text-xs flex-1"
                        />
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveExpertise(index)}
                      className="mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={handleAddExpertise} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expertise Item
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technologies Section</CardTitle>
                <CardDescription>Manage your technology tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {localContent.aboutTechnologies.map((tech, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-full bg-muted"
                    >
                      <span className="font-mono text-xs">{tech}</span>
                      <button
                        onClick={() => handleRemoveTechnology(index)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTechnology();
                      }
                    }}
                    placeholder="Add new technology"
                  />
                  <Button onClick={handleAddTechnology}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>Process Page</CardTitle>
                <CardDescription>Edit the Process page heading and subtext</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="processPageHeading">Page Heading</Label>
                  <Input
                    id="processPageHeading"
                    value={localContent.processPageHeading}
                    onChange={(e) => setLocalContent({ ...localContent, processPageHeading: e.target.value })}
                    placeholder="How I Work"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processPageSubtext">Page Subtext</Label>
                  <Textarea
                    id="processPageSubtext"
                    value={localContent.processPageSubtext}
                    onChange={(e) => setLocalContent({ ...localContent, processPageSubtext: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>Contact Page</CardTitle>
                <CardDescription>Edit the Contact page content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPageHeading">Page Heading</Label>
                  <Input
                    id="contactPageHeading"
                    value={localContent.contactPageHeading}
                    onChange={(e) => setLocalContent({ ...localContent, contactPageHeading: e.target.value })}
                    placeholder="Let's Work Together"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPageSubtext">Page Subtext</Label>
                  <Textarea
                    id="contactPageSubtext"
                    value={localContent.contactPageSubtext}
                    onChange={(e) => setLocalContent({ ...localContent, contactPageSubtext: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={localContent.contactEmail}
                    onChange={(e) => setLocalContent({ ...localContent, contactEmail: e.target.value })}
                    placeholder="hello@vdesigns.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactLocation">Location Text</Label>
                  <Textarea
                    id="contactLocation"
                    value={localContent.contactLocation}
                    onChange={(e) => setLocalContent({ ...localContent, contactLocation: e.target.value })}
                    rows={2}
                    placeholder="Based in San Francisco, CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactResponseTime">Response Time Text</Label>
                  <Input
                    id="contactResponseTime"
                    value={localContent.contactResponseTime}
                    onChange={(e) => setLocalContent({ ...localContent, contactResponseTime: e.target.value })}
                    placeholder="Usually within 24 hours"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your CMS portal password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={password}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Your current password (read-only)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button onClick={handleUpdatePassword}>
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CMS;
